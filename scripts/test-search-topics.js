const ai = require('../services/ai-generator');

async function test() {
  console.log('Testing AI Topic Search: "persen" [SD]...');
  const res1 = await ai.searchTopicsWithAi('persen', 'SD');
  console.log('Res 1 (persen):', JSON.stringify(res1, null, 2));

  console.log('\nTesting AI Topic Search: "pythagoras" [SMP]...');
  const res2 = await ai.searchTopicsWithAi('pythagoras', 'SMP');
  console.log('Res 2 (pythagoras):', JSON.stringify(res2, null, 2));

  console.log('\nTesting AI Topic Search: "euler" [KULIAHAN]...');
  const res3 = await ai.searchTopicsWithAi('euler', 'KULIAHAN');
  console.log('Res 3 (euler):', JSON.stringify(res3, null, 2));

  console.log('\nTesting AI Topic Search: General Random...');
  const res4 = await ai.searchTopicsWithAi('', 'SEMUA');
  console.log('Res 4 (random):', JSON.stringify(res4, null, 2));
}

test().catch(console.error);
