import dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolveMx = promisify(dns.resolveMx);
const resolveCname = promisify(dns.resolveCname);

const domain = 'despy.io';

async function checkDns() {
  console.log('🔍 Checking DNS records for', domain);
  console.log('-----------------------------------');

  try {
    // Check DKIM (CNAME)
    console.log('\n📝 Checking DKIM record...');
    try {
      const dkim = await resolveCname(`resend._domainkey.${domain}`);
      console.log('✅ DKIM record found:', dkim[0]);
    } catch (error) {
      console.log('❌ DKIM record not found or incorrect');
    }

    // Check SPF (TXT)
    console.log('\n📝 Checking SPF record...');
    try {
      const spf = await resolveTxt(domain);
      const spfRecord = spf.flat().find(record => record.startsWith('v=spf1'));
      if (spfRecord && spfRecord.includes('include:spf.resend.net')) {
        console.log('✅ SPF record found:', spfRecord);
      } else {
        console.log('❌ SPF record missing Resend configuration');
      }
    } catch (error) {
      console.log('❌ SPF record not found');
    }

    // Check DMARC (TXT)
    console.log('\n📝 Checking DMARC record...');
    try {
      const dmarc = await resolveTxt(`_dmarc.${domain}`);
      console.log('✅ DMARC record found:', dmarc.flat()[0]);
    } catch (error) {
      console.log('❌ DMARC record not found');
    }

    // Check Return-Path (MX)
    console.log('\n📝 Checking Return-Path record...');
    try {
      const mx = await resolveMx(`bounce.${domain}`);
      const amazonMx = mx.find(record => 
        record.exchange.includes('feedback-smtp') && 
        record.exchange.includes('amazonses.com')
      );
      if (amazonMx) {
        console.log('✅ Return-Path record found:', amazonMx.exchange);
      } else {
        console.log('❌ Return-Path record not found or incorrect');
      }
    } catch (error) {
      console.log('❌ Return-Path record not found');
    }

  } catch (error) {
    console.error('Error checking DNS records:', error);
  }
}

checkDns(); 