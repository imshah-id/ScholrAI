// Native fetch is available in Node.js 18+

async function checkHipo() {
  const url = "http://universities.hipolabs.com/search?name=Stanford";
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Hipo Data Sample for 'Stanford':");
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error fetching Hipo data:", e);
  }
}

checkHipo();
