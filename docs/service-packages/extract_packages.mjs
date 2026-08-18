import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = '/home/z/my-project/docs/service-packages';

// Target websites for wedding and corporate packages
const WEDDING_SITES = [
  { name: 'Ridgewells', url: 'https://www.ridgewells.com/weddings', domain: 'ridgewells.com' },
  { name: 'Wolfgang Puck', url: 'https://www.wolfgangpuckcatering.com/weddings/', domain: 'wolfgangpuckcatering.com' },
  { name: 'Sopranos', url: 'https://www.sopranoscatering.com/weddings/', domain: 'sopranoscatering.com' },
  { name: 'Concorde', url: 'https://www.concordecatering.ca/weddings', domain: 'concordecatering.ca' },
  { name: 'MyRadish', url: 'https://myradish.com/weddings/', domain: 'myradish.com' },
  { name: 'Talk of the Town', url: 'https://talkofthetownatlanta.com/weddings/', domain: 'talkofthetownatlanta.com' },
  { name: 'Queen of Hearts', url: 'https://queenofheartscatering.com/weddings/', domain: 'queenofheartscatering.com' },
  { name: 'Relish Caterers', url: 'https://relishcaterers.com/weddings/', domain: 'relishcaterers.com' },
  { name: 'Sterling Catering', url: 'https://sterlingcateringmn.com/weddings/', domain: 'sterlingcateringmn.com' },
  { name: 'Tall Guy', url: 'https://tallguyandagrill.com/weddings/', domain: 'tallguyandagrill.com' },
  { name: 'GG Catering', url: 'https://ggcatering.com/weddings/', domain: 'ggcatering.com' },
];

const CORPORATE_SITES = [
  { name: 'Ridgewells Corporate', url: 'https://www.ridgewells.com/corporate-events', domain: 'ridgewells.com' },
  { name: 'Wolfgang Puck Corporate', url: 'https://www.wolfgangpuckcatering.com/corporate-events/', domain: 'wolfgangpuckcatering.com' },
  { name: 'Sopranos Corporate', url: 'https://www.sopranoscatering.com/corporate-events/', domain: 'sopranoscatering.com' },
  { name: 'GG Catering Corporate', url: 'https://ggcatering.com/corporate-catering/', domain: 'ggcatering.com' },
  { name: 'MCulinary', url: 'https://mculinary.com/services/corporate-catering/', domain: 'mculinary.com' },
  { name: 'Salt Block', url: 'https://saltblockhospitality.com/corporate-events/', domain: 'saltblockhospitality.com' },
  { name: 'JDK Group', url: 'https://thejdkgroup.com/services/corporate-catering/', domain: 'thejdkgroup.com' },
  { name: 'Creative Edge', url: 'https://creativeedgeparties.com/corporate-events/', domain: 'creativeedgeparties.com' },
  { name: 'Elegant Affairs', url: 'https://elegantaffairscaterers.com/corporate-events/', domain: 'elegantaffairscaterers.com' },
  { name: 'Gamma Catering', url: 'https://gammacatering.com/en/corporate-catering/', domain: 'gammacatering.com' },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPage(zai, url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching: ${url}`);
      const result = await zai.functions.invoke('page_reader', { url });
      return result;
    } catch (error) {
      console.log(`Error (attempt ${i + 1}/${retries}): ${error.message}`);
      if (error.message.includes('429')) {
        console.log('Rate limited, waiting 60 seconds...');
        await sleep(60000);
      } else if (i < retries - 1) {
        await sleep(10000);
      }
    }
  }
  return null;
}

async function extractPackages(zai, sites, type) {
  const results = [];
  
  console.log(`\n=== EXTRACTING ${type.toUpperCase()} PACKAGES ===\n`);
  
  for (const site of sites) {
    await sleep(8000); // 8 second delay between requests
    const data = await fetchPage(zai, site.url);
    
    if (data && data.data) {
      const result = {
        company: site.name,
        domain: site.domain,
        url: site.url,
        title: data.data.title || '',
        content: data.data.html || data.data.text || '',
        text: data.data.text || '',
        fetchedAt: new Date().toISOString()
      };
      
      // Save individual file
      const safeName = site.domain.replace(/\./g, '_').replace(/-/g, '_');
      const filename = `${type}_${safeName}.json`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(result, null, 2));
      results.push(result);
      console.log(`✓ Saved: ${filename} (${(result.content.length / 1024).toFixed(1)}KB)`);
    } else {
      console.log(`✗ Failed: ${site.name}`);
    }
  }
  
  // Save combined results
  const combinedFile = `${type}-packages-raw.json`;
  fs.writeFileSync(path.join(OUTPUT_DIR, combinedFile), JSON.stringify(results, null, 2));
  console.log(`\nSaved combined: ${combinedFile}`);
  
  return results;
}

async function main() {
  console.log('Starting package extraction...');
  console.log('Output directory:', OUTPUT_DIR);
  
  try {
    const zai = await ZAI.create();
    
    const weddingResults = await extractPackages(zai, WEDDING_SITES, 'wedding');
    console.log(`\nWedding packages extracted: ${weddingResults.length}/${WEDDING_SITES.length}`);
    
    const corporateResults = await extractPackages(zai, CORPORATE_SITES, 'corporate');
    console.log(`\nCorporate packages extracted: ${corporateResults.length}/${CORPORATE_SITES.length}`);
    
    console.log('\n=== EXTRACTION COMPLETE ===');
  } catch (error) {
    console.error('Extraction error:', error.message);
    process.exit(1);
  }
}

main();
