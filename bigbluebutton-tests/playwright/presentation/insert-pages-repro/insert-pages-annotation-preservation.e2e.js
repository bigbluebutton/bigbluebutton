const { chromium } = require("playwright-core");
const path=require("path");
const OUT=process.env.OUT_DIR, PRES_URL=process.env.PRES_URL, REV_URL=process.env.REV_URL;
const log=m=>console.log(`[${new Date().toISOString()}] ${m}`);
const SKIP='[data-test="skipSlide"]', CONT='[data-test="presentationContainer"]';
const cur=p=>p.locator(SKIP).inputValue().catch(()=>"?");
async function dismiss(p){for(let i=0;i<7;i++){await p.waitForTimeout(2500);const c=p.locator('[data-test="closeModal"]');if((await c.count().catch(()=>0))>0&&await c.first().isVisible().catch(()=>false)){await c.first().click({timeout:5000}).catch(()=>{});}}}
async function anno(p,text,dx,dy){const b=p.locator('[data-testid="tools.text"]');await b.first().click({timeout:8000});await p.waitForTimeout(400);const bx=await p.locator(CONT).boundingBox();await p.mouse.click(bx.x+bx.width*dx,bx.y+bx.height*dy);await p.waitForTimeout(600);await p.keyboard.type(text,{delay:70});await p.waitForTimeout(500);await p.keyboard.press("Escape");await p.waitForTimeout(300);const s=p.locator('[data-testid="tools.select"]');if(await s.count().catch(()=>0))await s.first().click().catch(()=>{});await p.keyboard.press("Escape");await p.waitForTimeout(800);log(`anno ${text} on slide ${await cur(p)}`);}
async function pnext(p){await p.locator('[data-test="nextSlide"]').click({timeout:8000});await p.waitForTimeout(4500);log(`next->${await cur(p)}`);}
async function pprev(p){await p.locator('[data-test="prevSlide"]').click({timeout:8000});await p.waitForTimeout(4500);log(`prev->${await cur(p)}`);}
async function pgo(p,n){await p.selectOption(SKIP,String(n)).catch(()=>{});await p.waitForTimeout(4500);log(`go(${n})->${await cur(p)}`);}
async function shot(p,n){await p.screenshot({path:path.join(OUT,n+".png")});log("shot "+n);}
let sN=0; const S=n=>String(sN++).padStart(2,"0")+"_"+n;

(async()=>{
  const b=await chromium.launch({headless:true});
  const pc=await b.newContext({ignoreHTTPSErrors:true,viewport:{width:1600,height:1000},recordVideo:{dir:OUT,size:{width:1600,height:1000}}});
  const P=await pc.newPage();
  await P.goto(PRES_URL,{waitUntil:"networkidle",timeout:90000});
  await dismiss(P); await P.waitForSelector(CONT,{timeout:60000}); await P.waitForTimeout(4000);
  log("PRES loaded slide "+await cur(P)); await shot(P,S("P_loaded"));
  // roteiro
  await pgo(P,1); await anno(P,"1a",0.42,0.60); await shot(P,S("P_step1_1a"));
  await pnext(P); await anno(P,"2a",0.42,0.60); await shot(P,S("P_step2_2a"));
  await pprev(P); await shot(P,S("P_step3_back1"));
  await P.locator('[data-test="insertPagesButton"]').click({timeout:8000}); await P.waitForTimeout(800); await shot(P,S("P_step4_dropdown"));
  await P.locator('[data-test="insertBlankPage"]').click({timeout:8000}); await P.waitForTimeout(12000);
  log("PRES after insert slide "+await cur(P)+" total "+await P.locator(SKIP+' option').count()); await shot(P,S("P_step4_afterInsert"));
  await pgo(P,1); await pnext(P); await P.waitForTimeout(6000); await shot(P,S("P_step5_onBlank")); await anno(P,"1b",0.42,0.45); await P.waitForTimeout(2500); await shot(P,S("P_step6_1b"));

  // ---- fresh REVIEWER (viewer) joins, will follow the presenter ----
  const rc=await b.newContext({ignoreHTTPSErrors:true,viewport:{width:1600,height:1000}});
  const R=await rc.newPage();
  R.on("console",m=>{if(m.type()==="error")log("R_PERR "+m.text().slice(0,80));});
  await R.goto(REV_URL,{waitUntil:"networkidle",timeout:90000});
  await dismiss(R);
  try{await R.waitForSelector(CONT,{timeout:60000});}catch(e){await shot(R,"REV_FAIL");log("rev no container");}
  await R.waitForTimeout(6000); log("REV joined, follows presenter");

  // Verification: presenter navigates, reviewer follows; screenshot BOTH each slide
  await pgo(P,1); await P.waitForTimeout(5000); await R.waitForTimeout(6000);
  await shot(P,S("P_step7_verify_s1_1a")); await shot(R,"REV_slide1");
  await pnext(P); await P.waitForTimeout(5000); await R.waitForTimeout(6000);
  await shot(P,S("P_step8_verify_s2_1b")); await shot(R,"REV_slide2");
  await pnext(P); await P.waitForTimeout(5000); await R.waitForTimeout(6000);
  await shot(P,S("P_step9_verify_s3_2a")); await shot(R,"REV_slide3");

  await P.waitForTimeout(2000);
  await rc.close();
  await pc.close(); // flush presenter video
  await b.close();
  log("DONE");
})().catch(e=>{console.error("RUN7_FAIL "+(e.stack||e.message));process.exit(1);});
