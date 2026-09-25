async function inspect() {
  const res = await fetch('https://vlsm-vlab.vercel.app/assets/index-B2KpbOQE.js');
  const text = await res.text();
  
  // Find where id:`architecture` is rendered
  const archIdx = text.indexOf('id:`architecture`');
  if (archIdx !== -1) {
    console.log('Architecture section code:');
    console.log(text.slice(archIdx, archIdx + 1500));
  }
}
inspect();
