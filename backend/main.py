from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import json
from fastapi.middleware.cors import CORSMiddleware
import requests  # For Alchemy/Helius API calls
from solana.rpc.api import Client as SolanaClient
from solders.pubkey import Pubkey as PublicKey
from solders.system_program import ID as SYSTEM_PROGRAM_ID
from solders.spl.token.constants import TOKEN_PROGRAM_ID

# Initialize FastAPI app
app = FastAPI(
    title="DeSpy AI MVP",
    description="Real-time Web3 forensics platform for scam detection and wallet tracing.",
    version="0.1.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup: SQLite for MVP
ENGINE = create_engine("sqlite:///./despy.db")
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=ENGINE)

# Database models
class WalletLog(Base):
    __tablename__ = "wallet_logs"
    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, index=True)
    chain = Column(String)
    trace_data = Column(JSON)
    score = Column(Float)
    risk_flags = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class TokenLog(Base):
    __tablename__ = "token_logs"
    id = Column(Integer, primary_key=True, index=True)
    token_address = Column(String, index=True)
    chain = Column(String)
    risk_info = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

Base.metadata.create_all(bind=ENGINE)

# Pydantic models
class WalletInput(BaseModel):
    address: str
    chain: str  # 'ethereum' or 'solana'

class Event(BaseModel):
    timestamp: datetime.datetime
    type: str
    details: dict

class TraceResponse(BaseModel):
    history: List[Event]
    flags: List[str]

class ScoreResponse(BaseModel):
    score: float
    explanation: str

class TokenRisk(BaseModel):
    is_rugpull: bool
    is_honeypot: bool
    age_days: int
    audit_status: str
    tx_pattern: str

class DetectTokenResponse(BaseModel):
    risk: TokenRisk

# API keys from env
ALCHEMY_API_KEY = os.getenv("ALCHEMY_API_KEY", "demo")
HELIUS_API_KEY = os.getenv("HELIUS_API_KEY", "demo")
SOLANA_RPC_URL = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}" if HELIUS_API_KEY != "demo" else "https://api.mainnet-beta.solana.com"
sol_client = SolanaClient(SOLANA_RPC_URL)

# Mock fallback
def mock_wallet_history(address: str, chain: str) -> List[Event]:
    now = datetime.datetime.now(datetime.timezone.utc)
    return [
        Event(timestamp=now - datetime.timedelta(days=1), type='transfer', details={'token': 'USDC', 'value': 100}),
        Event(timestamp=now - datetime.timedelta(hours=2), type='interaction', details={'contract': 'TornadoCash', 'action': 'deposit'}),
        Event(timestamp=now - datetime.timedelta(minutes=30), type='transfer', details={'token': 'SUS_TOKEN', 'value': 1000, 'fast_dump': True}),
    ]

# Ethereum real fetch (Alchemy)
def fetch_ethereum_history(address: str) -> List[Event]:
    if ALCHEMY_API_KEY == "demo":
        return mock_wallet_history(address, 'ethereum')
    
    url = f"https://eth-mainnet.g.alchemy.com/v2/{ALCHEMY_API_KEY}"
    payload = {
        "jsonrpc": "2.0",
        "id": 0,
        "method": "alchemy_getAssetTransfers",
        "params": [
            {
                "fromBlock": "0x0",
                "toBlock": "latest",
                "fromAddress": address,
                "category": ["erc20", "erc721"],
                "maxCount": "0x3e8"  # 1000 transfers max
            }
        ]
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json().get('result', {}).get('transfers', [])
        events = []
        for tx in data:
            block_num = int(tx['blockNum'], 16)
            # Approximate timestamp (could fetch block timestamp for accuracy)
            timestamp = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=(0x10000000 - block_num) / 7200)  # Rough estimate, ~12s/block
            details = {
                'token': tx['rawContract']['address'],
                'value': tx['value'],
                'from': tx['from'],
                'to': tx['to'],
                'hash': tx['hash']
            }
            events.append(Event(timestamp=timestamp, type='transfer', details=details))
        return events
    except Exception as e:
        print(f"Alchemy error: {e}")
        return mock_wallet_history(address, 'ethereum')

# Solana real fetch (Helius RPC)
def fetch_solana_history(address: str) -> List[Event]:
    if HELIUS_API_KEY == "demo":
        return mock_wallet_history(address, 'solana')
    
    try:
        pubkey = PublicKey(address)
        sigs = sol_client.get_signatures_for_address(pubkey, limit=10).value  # Limit for MVP
        events = []
        for sig in sigs:
            tx_response = sol_client.get_transaction(sig.signature)
            tx = tx_response.value
            if tx and tx.block_time:
                timestamp = datetime.datetime.fromtimestamp(tx.block_time, tz=datetime.timezone.utc)
                for instruction in tx.transaction.message.instructions:
                    if instruction.program_id == TOKEN_PROGRAM_ID:
                        # Simplified SPL transfer parsing (source, dest, amount from accounts/data)
                        details = {
                            'token': 'SPL Token',  # Could parse mint from data
                            'value': 'unknown',  # Parse from instruction data
                            'from': str(instruction.accounts[0]),
                            'to': str(instruction.accounts[1]),
                            'hash': str(sig.signature)
                        }
                        events.append(Event(timestamp=timestamp, type='transfer', details=details))
        return events
    except Exception as e:
        print(f"Helius/Solana error: {e}")
        return mock_wallet_history(address, 'solana')

# Unified fetch
def fetch_wallet_history(address: str, chain: str) -> List[Event]:
    if chain.lower() == 'ethereum':
        return fetch_ethereum_history(address)
    elif chain.lower() == 'solana':
        return fetch_solana_history(address)
    else:
        raise ValueError("Unsupported chain")

# Heuristics for suspicious behavior
def detect_suspicious_flags(history: List[Event]) -> List[str]:
    flags = []
    risky_tokens = ['SUS_TOKEN', 'HONEYPOT']  # Expand with real scam DB later
    for event in history:
        if 'TornadoCash' in event.details.get('contract', '') or 'tornado' in event.details.get('hash', '').lower():
            flags.append('tornado_cash_use')
        if event.details.get('fast_dump', False):  # Could detect based on tx volume/time
            flags.append('fast_dump')
        if event.details.get('token') in risky_tokens:
            flags.append('risky_token_interaction')
    return list(set(flags))

# Scoring logic
def calculate_wallet_score(flags: List[str], history: List[Event]) -> tuple[float, str]:
    """
    Score wallet trust level 0-100.
    Base score 100, deduct points for flags.
    """
    score = 100.0
    explanation = "Wallet score breakdown:\n"
    
    tornado_count = flags.count('tornado_cash_use')
    if tornado_count > 0:
        score -= 30 * tornado_count
        explanation += f"- Deducted {30 * tornado_count} for TornadoCash use.\n"
    
    dump_count = sum(1 for e in history if e.details.get('fast_dump', False))
    if dump_count > 0:
        score -= 20 * dump_count
        explanation += f"- Deducted {20 * dump_count} for fast dumps.\n"
    
    risky_count = flags.count('risky_token_interaction')
    if risky_count > 0:
        score -= 15 * risky_count
        explanation += f"- Deducted {15 * risky_count} for risky token interactions.\n"
    
    score = max(0, min(100, score))
    if score == 100:
        explanation += "No suspicious activity detected."
    return score, explanation

# Token risk detection
def detect_token_risk(token_address: str, chain: str) -> TokenRisk:
    """
    Detect rugpull/honeypot, contract age, audit, tx pattern.
    MVP: Mock data based on address.
    """
    if 'honeypot' in token_address.lower():
        return TokenRisk(is_rugpull=False, is_honeypot=True, age_days=5, audit_status='unaudited', tx_pattern='suspicious')
    elif 'rug' in token_address.lower():
        return TokenRisk(is_rugpull=True, is_honeypot=False, age_days=10, audit_status='unknown', tx_pattern='fast_liquidity_removal')
    else:
        return TokenRisk(is_rugpull=False, is_honeypot=False, age_days=365, audit_status='audited', tx_pattern='normal')

# API Routes
@app.post("/trace-wallet", response_model=TraceResponse)
async def trace_wallet(input: WalletInput):
    """
    Trace wallet history and flag suspicious behavior.
    """
    try:
        history = fetch_wallet_history(input.address, input.chain)
        flags = detect_suspicious_flags(history)
        
        db = SessionLocal()
        log = WalletLog(wallet_address=input.address, chain=input.chain, trace_data=[e.model_dump(mode='json') for e in history], risk_flags=flags)
        db.add(log)
        db.commit()
        db.refresh(log)
        
        return TraceResponse(history=history, flags=flags)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/score-wallet", response_model=ScoreResponse)
async def score_wallet(input: WalletInput):
    """
    Score wallet trust level with explanation.
    """
    try:
        history = fetch_wallet_history(input.address, input.chain)
        flags = detect_suspicious_flags(history)
        score, explanation = calculate_wallet_score(flags, history)
        
        db = SessionLocal()
        log = WalletLog(wallet_address=input.address, chain=input.chain, trace_data=[e.model_dump(mode='json') for e in history], score=score, risk_flags=flags)
        db.add(log)
        db.commit()
        
        return ScoreResponse(score=score, explanation=explanation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-token", response_model=DetectTokenResponse)
async def detect_token(input: WalletInput):
    """
    Detect token risks for a contract address.
    """
    try:
        risk = detect_token_risk(input.address, input.chain)
        
        db = SessionLocal()
        log = TokenLog(token_address=input.address, chain=input.chain, risk_info=risk.model_dump(mode='json'))
        db.add(log)
        db.commit()
        
        return DetectTokenResponse(risk=risk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)