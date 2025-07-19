// scripts/setup-ml-database.js
import { sql } from '@vercel/postgres'

async function setupMLDatabase() {
  try {
    console.log('Setting up ML database tables...')

    // Create ML analysis requests table
    await sql`
      CREATE TABLE IF NOT EXISTS ml_analysis_requests (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(255) NOT NULL,
        chain VARCHAR(50) DEFAULT 'ethereum',
        analysis_type VARCHAR(50) DEFAULT 'full',
        ip_address VARCHAR(45) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        INDEX idx_wallet_address (wallet_address),
        INDEX idx_created_at (created_at),
        INDEX idx_ip_address (ip_address)
      )
    `
    console.log('✅ Created ml_analysis_requests table')

    // Create ML analysis results table
    await sql`
      CREATE TABLE IF NOT EXISTS ml_analysis_results (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(255) NOT NULL,
        chain VARCHAR(50) DEFAULT 'ethereum',
        analysis_type VARCHAR(50) DEFAULT 'full',
        threats_detected INTEGER DEFAULT 0,
        confidence_score DECIMAL(5,2) DEFAULT 0,
        risk_score DECIMAL(5,2) DEFAULT 0,
        model_performance JSONB,
        analysis_data JSONB,
        processing_time DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        INDEX idx_wallet_address (wallet_address),
        INDEX idx_created_at (created_at),
        INDEX idx_confidence_score (confidence_score),
        INDEX idx_risk_score (risk_score)
      )
    `
    console.log('✅ Created ml_analysis_results table')

    // Create ML threats table
    await sql`
      CREATE TABLE IF NOT EXISTS ml_threats (
        id SERIAL PRIMARY KEY,
        analysis_id INTEGER REFERENCES ml_analysis_results(id) ON DELETE CASCADE,
        threat_type VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        confidence DECIMAL(5,2) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        description TEXT,
        model VARCHAR(100) NOT NULL,
        evidence JSONB,
        recommendations JSONB,
        risk_score DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        INDEX idx_analysis_id (analysis_id),
        INDEX idx_threat_type (threat_type),
        INDEX idx_severity (severity),
        INDEX idx_confidence (confidence),
        INDEX idx_created_at (created_at)
      )
    `
    console.log('✅ Created ml_threats table')

    // Create ML model performance table
    await sql`
      CREATE TABLE IF NOT EXISTS ml_model_performance (
        id SERIAL PRIMARY KEY,
        model_name VARCHAR(100) NOT NULL,
        accuracy DECIMAL(5,2),
        precision DECIMAL(5,2),
        recall DECIMAL(5,2),
        f1_score DECIMAL(5,2),
        false_positive_rate DECIMAL(5,2),
        true_positive_rate DECIMAL(5,2),
        training_samples INTEGER,
        test_samples INTEGER,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        INDEX idx_model_name (model_name),
        INDEX idx_last_updated (last_updated)
      )
    `
    console.log('✅ Created ml_model_performance table')

    // Create ML threat patterns table
    await sql`
      CREATE TABLE IF NOT EXISTS ml_threat_patterns (
        id SERIAL PRIMARY KEY,
        pattern_name VARCHAR(255) NOT NULL,
        pattern_type VARCHAR(100) NOT NULL,
        pattern_signature TEXT NOT NULL,
        threat_category VARCHAR(100) NOT NULL,
        confidence_threshold DECIMAL(5,2) DEFAULT 70.0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        INDEX idx_pattern_type (pattern_type),
        INDEX idx_threat_category (threat_category),
        INDEX idx_is_active (is_active)
      )
    `
    console.log('✅ Created ml_threat_patterns table')

    // Create ML analysis metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS ml_analysis_metrics (
        id SERIAL PRIMARY KEY,
        analysis_id INTEGER REFERENCES ml_analysis_results(id) ON DELETE CASCADE,
        transactions_analyzed INTEGER DEFAULT 0,
        time_period VARCHAR(50),
        patterns_detected INTEGER DEFAULT 0,
        risk_indicators INTEGER DEFAULT 0,
        volume_analyzed DECIMAL(20,8),
        currency VARCHAR(10) DEFAULT 'ETH',
        data_points INTEGER DEFAULT 0,
        processing_time DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        INDEX idx_analysis_id (analysis_id),
        INDEX idx_created_at (created_at)
      )
    `
    console.log('✅ Created ml_analysis_metrics table')

    // Insert sample ML model performance data
    await sql`
      INSERT INTO ml_model_performance (
        model_name, accuracy, precision, recall, f1_score, 
        false_positive_rate, true_positive_rate, training_samples, test_samples
      ) VALUES 
        ('anomaly_detection', 94.2, 91.8, 89.5, 90.6, 2.3, 89.5, 50000, 10000),
        ('pattern_recognition', 92.8, 90.2, 88.1, 89.1, 3.1, 88.1, 45000, 9000),
        ('behavioral_analysis', 93.5, 91.1, 87.9, 89.4, 2.8, 87.9, 48000, 9500),
        ('transaction_clustering', 91.9, 89.7, 86.3, 87.9, 3.5, 86.3, 42000, 8500),
        ('risk_scoring', 95.1, 93.2, 91.8, 92.5, 1.9, 91.8, 52000, 10500)
      ON CONFLICT (model_name) DO NOTHING
    `
    console.log('✅ Inserted sample ML model performance data')

    // Insert sample threat patterns
    await sql`
      INSERT INTO ml_threat_patterns (
        pattern_name, pattern_type, pattern_signature, threat_category, confidence_threshold
      ) VALUES 
        ('Phishing Transaction Pattern', 'transaction_flow', 'multiple_small_transactions_to_suspicious_addresses', 'phishing', 75.0),
        ('Rug Pull Liquidity Removal', 'liquidity_analysis', 'sudden_large_liquidity_removal_followed_by_dumping', 'rug_pull', 85.0),
        ('Wash Trading Circular Flow', 'volume_analysis', 'circular_transactions_with_artificial_volume', 'wash_trading', 80.0),
        ('Frontrunning MEV Pattern', 'transaction_ordering', 'mev_like_transaction_ordering_with_gas_manipulation', 'frontrunning', 90.0),
        ('Money Laundering Layering', 'transaction_chain', 'complex_transaction_chains_through_privacy_protocols', 'money_laundering', 88.0),
        ('Bot Trading Signature', 'timing_analysis', 'high_frequency_trading_with_millisecond_timing', 'bot_activity', 82.0)
      ON CONFLICT (pattern_name) DO NOTHING
    `
    console.log('✅ Inserted sample threat patterns')

    console.log('🎉 ML database setup completed successfully!')
    
    // Display table statistics
    const tables = [
      'ml_analysis_requests',
      'ml_analysis_results', 
      'ml_threats',
      'ml_model_performance',
      'ml_threat_patterns',
      'ml_analysis_metrics'
    ]

    for (const table of tables) {
      const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`
      console.log(`📊 ${table}: ${result.rows[0].count} records`)
    }

  } catch (error) {
    console.error('❌ Error setting up ML database:', error)
    throw error
  }
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupMLDatabase()
    .then(() => {
      console.log('✅ ML database setup completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ ML database setup failed:', error)
      process.exit(1)
    })
}

export default setupMLDatabase 