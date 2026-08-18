const ZAI = require('z-ai-web-dev-sdk');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = '/home/z/my-project/docs/service-packages';

// Target websites for wedding and corporate packages
const TARGET_SITES = {
  wedding: [
    { name: 'Ridgewells', url: 'https://www.ridgewells.com/weddings', domain: 'ridgewells.com' },
    { name: 'Wolfgang Puck', url: 'https://www.wolfgangpuckcatering.com/weddings/', domain: 'wolfgangpuckcatering.com' },
    { name: 'Sopranos', url: 'https://www.sopranoscatering.com/weddings/', domain: 'sopranoscatering.com' },
    { name: 'Concorde', url: 'https://www.concordecatering.ca/weddings', domain: 'concordecatering.ca' },
    { name: 'MyRadish', url: 'https://myradish.com/weddings/', domain: 'myradish.com' },
    { name: 'Concept Catering', url: 'https://concept-catering.de/hochzeiten/', domain: 'concept-catering.de' },
    { name: 'Talk of the Town', url: 'https://talkofthetownatlanta.com/weddings/', domain: 'talkofthetownatlanta.com' },
    { name: 'Queen of Hearts', url: 'https://queenofheartscatering.com/weddings/', domain: 'queenofheartscatering.com' },
    { name: 'Chic Chef', url: 'https://chicchefcatering.com/weddings/', domain: 'chicchefcatering.com' },
    { name: 'Relish Caterers', url: 'https://relishcaterers.com/weddings/', domain: 'relishcaterers.com' },
    { name: 'Sterling Catering', url: 'https://sterlingcateringmn.com/weddings/', domain: 'sterlingcateringmn.com' },
  ],
  corporate: [
    { name: 'Ridgewells Corporate', url: 'https://www.ridgewells.com/corporate', domain: 'ridgewells.com' },
    { name: 'Wolfgang Puck Corporate', url: 'https://www.wolfgangpuckcatering.com/corporate-events/', domain: 'wolfgangpuckcatering.com' },
    { name: 'Sopranos Corporate', url: 'https://www.sopranoscatering.com/corporate/', domain: 'sopranoscatering.com' },
    { name: 'GG Catering', url: 'https://ggcatering.com/corporate-catering/', domain: 'ggcatering.com' },
    { name: 'MCulinary', url: 'https://mculinary.com/services/corporate/', domain: 'mculinary.com' },
    { name: 'Salt Block', url: 'https://saltblockhospitality.com/corporate-events/', domain: 'saltblockhospitality.com' },
    { name: 'JDK Group', url: 'https://thejdkgroup.com/corporate-catering/', domain: 'thejdkgroup.com' },
    { name: 'Creative Edge', url: 'https://creativeedgeparties.com/corporate-events/', domain: 'creativeedgeparties.com' },
    { name: 'Elegant Affairs', url: 'https://elegantaffairscaterers.com/corporate/', domain: 'elegantaffairscaterers.com' },
    { name: 'Gamma Catering', url: 'https://gammacatering.com/en/corporate/', domain: 'gammacatering.com' },
  ]
};

async function sleep(ms) {
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

async function extractWeddingPackages() {
  const zai = await ZAI.create();
  const results = [];
  
  console.log('\n=== EXTRACTING WEDDING PACKAGES ===\n');
  
  for (const site of TARGET_SITES.wedding) {
    await sleep(5000); // 5 second delay between requests
    const data = await fetchPage(zai, site.url);
    
    if (data && data.data) {
      const result = {
        company: site.name,
        domain: site.domain,
        url: site.url,
        title: data.data.title,
        content: data.data.html || data.data.text || '',
        fetchedAt: new Date().toISOString()
      };
      
      // Save individual file
      const filename = `wedding_${site.domain.replace(/\./g, '_')}.json`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(result, null, 2));
      results.push(result);
      console.log(`✓ Saved: ${filename}`);
    } else {
      console.log(`✗ Failed: ${site.name}`);
    }
  }
  
  // Save combined results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'wedding-packages-raw.json'),
    JSON.stringify(results, null, 2)
  );
  
  return results;
}

async function extractCorporatePackages() {
  const zai = await ZAI.create();
  const results = [];
  
  console.log('\n=== EXTRACTING CORPORATE PACKAGES ===\n');
  
  for (const site of TARGET_SITES.corporate) {
    await sleep(5000); // 5 second delay between requests
    const data = await fetchPage(zai, site.url);
    
    if (data && data.data) {
      const result = {
        company: site.name,
        domain: site.domain,
        url: site.url,
        title: data.data.title,
        content: data.data.html || data.data.text || '',
        fetchedAt: new Date().toISOString()
      };
      
      // Save individual file
      const filename = `corporate_${site.domain.replace(/\./g, '_')}.json`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(result, null, 2));
      results.push(result);
      console.log(`✓ Saved: ${filename}`);
    } else {
      console.log(`✗ Failed: ${site.name}`);
    }
  }
  
  // Save combined results
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'corporate-packages-raw.json'),
    JSON.stringify(results, null, 2)
  );
  
  return results;
}

async function main() {
  console.log('Starting package extraction...');
  console.log('Output directory:', OUTPUT_DIR);
  
  try {
    const weddingResults = await extractWeddingPackages();
    console.log(`\nWedding packages extracted: ${weddingResults.length}`);
    
    const corporateResults = await extractCorporatePackages();
    console.log(`\nCorporate packages extracted: ${corporateResults.length}`);
    
    console.log('\n=== EXTRACTION COMPLETE ===');
  } catch (error) {
    console.error('Extraction error:', error.message);
  }
}

main();
