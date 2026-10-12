(()=>{
'use strict';
const $=id=>document.getElementById(id);
const canvas=$('posterCanvas'),ctx=canvas.getContext('2d');
let photo=null,eventPortrait=null,portraitKey='',posterReady=false,videoBlob=null,animationId=null,stream=null,recorder=null,chunks=[];
const portraitUrls={ambedkar:'https://commons.wikimedia.org/wiki/Special:FilePath/Dr_Ambedkar.jpg',gandhi:'https://commons.wikimedia.org/wiki/Special:FilePath/Portrait_Gandhi.jpg',savitribai:'https://commons.wikimedia.org/wiki/Special:FilePath/First_woman_Teacher_Savitri_Bai_Phule.jpg'};
function loadEventPortrait(){const key=$('occasionSelect').value;if(key===portraitKey)return;portraitKey=key;eventPortrait=null;const url=portraitUrls[key];if(!url){if(photo)render();return}const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{if(portraitKey===key){eventPortrait=img;if(photo)render()}};img.onerror=()=>{eventPortrait=null;if(photo)render()};img.src=url;}
const occasions={
 today:{title:'आज के दिन की शुभकामनाएँ',message:'आपका दिन खुशियों, स्वास्थ्य और सफलता से भरा रहे।',theme:'gold',emoji:'✨'},
 navratri:{title:'नवरात्रि की हार्दिक शुभकामनाएँ',message:'माँ दुर्गा आपके जीवन में सुख, शक्ति और समृद्धि भरें। जय माता दी!',theme:'red',emoji:'🌺'},
 diwali:{title:'दीपावली की हार्दिक शुभकामनाएँ',message:'दीपों का प्रकाश आपके घर में सुख, शांति और समृद्धि लाए।',theme:'gold',emoji:'🪔'},
 holi:{title:'होली की हार्दिक शुभकामनाएँ',message:'रंगों की तरह आपका जीवन भी प्रेम और खुशियों से भर जाए।',theme:'pink',emoji:'🎨'},
 ambedkar:{title:'डॉ. बाबासाहेब आंबेडकर जयंती',message:'समानता, शिक्षा और न्याय के विचारों को नमन।',theme:'blue',emoji:'📘',dates:'जन्म: 14 अप्रैल 1891  •  महापरिनिर्वाण: 6 दिसंबर 1956'},
 gandhi:{title:'महात्मा गांधी को नमन',message:'सत्य और अहिंसा के मार्ग से प्रेरणा लेते रहें।',theme:'green',emoji:'🕊️',dates:'जन्म: 2 अक्टूबर 1869  •  पुण्यतिथि: 30 जनवरी 1948'},
 savitribai:{title:'सावित्रीबाई फुले को नमन',message:'शिक्षा और समानता की ज्योति जलाने वाली महान शिक्षिका को नमन।',theme:'pink',emoji:'📚',dates:'जन्म: 3 जनवरी 1831  •  पुण्यतिथि: 10 मार्च 1897'},
 custom:{title:'हार्दिक शुभकामनाएँ',message:'आपको और आपके परिवार को ढेरों शुभकामनाएँ।',theme:'purple',emoji:'💐'}
};
const themes={gold:['#241044','#8b4c5b','#ffd783','#fff5d9'],red:['#4d071d','#b51f3b','#ffca80','#fff2e7'],blue:['#061e49','#1769aa','#a7e7ff','#f0fbff'],green:['#073d36','#15806d','#ffe49b','#f0fff8'],pink:['#681e54','#d94f8d','#ffd3e8','#fff2f8'],purple:['#241044','#7b3cdb','#f4c6ff','#fff5ff']};
function status(s){$('status').textContent=s}
function roundedRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function fitText(text,maxWidth,size,weight='700'){ctx.font=`${weight} ${size}px system-ui, sans-serif`;while(ctx.measureText(text).width>maxWidth&&size>14){size--;ctx.font=`${weight} ${size}px system-ui, sans-serif`}return size}
function drawCover(img,x,y,w,h){const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale,sx=(img.width-sw)/2,sy=(img.height-sh)/2;ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h)}
function drawPoster(time=0,forVideo=false){
const w=canvas.width,h=canvas.height,occ=occasions[$('occasionSelect').value]||occasions.today,theme=$('themeSelect').value||occ.theme,p=themes[theme]||themes.gold,frame=$('frameSelect').value,key=$('occasionSelect').value;
// Rich occasion-specific background and light rays
const grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,p[0]);grad.addColorStop(.48,p[1]);grad.addColorStop(1,p[0]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
const glow=ctx.createRadialGradient(w/2,390,20,w/2,390,440);glow.addColorStop(0,p[2]+'55');glow.addColorStop(1,p[0]+'00');ctx.fillStyle=glow;ctx.fillRect(0,80,w,700);
for(let i=0;i<18;i++){const x=w/2+(i-9)*47;ctx.save();ctx.globalAlpha=.08+((i%3)*.02);ctx.fillStyle=p[2];ctx.beginPath();ctx.moveTo(w/2,100);ctx.lineTo(x-20,650);ctx.lineTo(x+20,650);ctx.closePath();ctx.fill();ctx.restore()}
// floating light particles
for(let i=0;i<85;i++){let x=(i*137+Math.sin(time/500+i)*25+w)%w,y=(i*211+(time/8*(i%3+1)))%h;ctx.globalAlpha=.18+(i%4)*.08;ctx.fillStyle=p[2];ctx.beginPath();ctx.arc(x,y,i%3+1,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
// layered ornamental borders and corner flourishes
ctx.save();ctx.shadowColor=p[2];ctx.shadowBlur=frame==='glow'?28:12;ctx.strokeStyle=p[2];ctx.lineWidth=frame==='minimal'?3:6;roundedRect(ctx,20,20,w-40,h-40,28);ctx.stroke();ctx.restore();ctx.strokeStyle=p[3];ctx.lineWidth=2;roundedRect(ctx,34,34,w-68,h-68,23);ctx.stroke();
for(const [x,y,rot] of [[62,70,0],[w-62,70,Math.PI/2],[62,h-70,-Math.PI/2],[w-62,h-70,Math.PI]]){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.strokeStyle=p[2];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(0,-22);ctx.lineTo(18,0);ctx.lineTo(0,22);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.stroke();ctx.restore()}
const title=$('customTitle').value.trim()&&key==='custom' ? $('customTitle').value.trim():occ.title;
ctx.textAlign='center';ctx.fillStyle=p[2];ctx.font='bold 25px system-ui';ctx.fillText(occ.emoji||'✦',w/2,91);
ctx.fillStyle=p[3];let tsize=fitText(title,w-100,34,'800');ctx.font=`800 ${tsize}px system-ui`;ctx.fillText(title,w/2,145);
// Main event portrait for historical figures; festive illustrated emblem for festivals
const cx=w/2,cy=405,r=174;
ctx.save();ctx.shadowColor=p[2];ctx.shadowBlur=35;ctx.fillStyle=p[2];ctx.beginPath();ctx.arc(cx,cy,r+14,0,Math.PI*2);ctx.fill();ctx.restore();
ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();
if(eventPortrait&&portraitKey===key){drawCover(eventPortrait,cx-r,cy-r,r*2,r*2)}else{
 const inner=ctx.createRadialGradient(cx-r*.25,cy-r*.35,8,cx,cy,r*1.3);inner.addColorStop(0,p[2]);inner.addColorStop(1,p[0]);ctx.fillStyle=inner;ctx.fillRect(cx-r,cy-r,r*2,r*2);
 if(key==='navratri'){ctx.textAlign='center';ctx.font='150px serif';ctx.fillText('🪷',cx,cy+22);ctx.font='68px serif';ctx.fillText('🔱',cx,cy+95)}
 else if(key==='diwali'){ctx.textAlign='center';ctx.font='130px serif';ctx.fillText('🪔',cx,cy+28);ctx.font='62px serif';ctx.fillText('✨',cx,cy-75)}
 else if(key==='holi'){ctx.textAlign='center';ctx.font='126px serif';ctx.fillText('🎨',cx,cy+24);ctx.font='46px serif';ctx.fillText('🌈',cx,cy-76)}
 else if(key==='ambedkar'){ctx.textAlign='center';ctx.font='115px serif';ctx.fillText('📘',cx,cy+20);ctx.font='bold 24px system-ui';ctx.fillStyle=p[3];ctx.fillText('संविधान • समानता',cx,cy+78)}
 else if(key==='gandhi'){ctx.textAlign='center';ctx.font='125px serif';ctx.fillText('🕊️',cx,cy+30);ctx.font='bold 23px system-ui';ctx.fillStyle=p[3];ctx.fillText('सत्य • अहिंसा',cx,cy+82)}
 else if(key==='savitribai'){ctx.textAlign='center';ctx.font='120px serif';ctx.fillText('📚',cx,cy+25);ctx.font='bold 22px system-ui';ctx.fillStyle=p[3];ctx.fillText('शिक्षा • समानता',cx,cy+82)}
 else {ctx.textAlign='center';ctx.font='125px serif';ctx.fillText(occ.emoji||'🌸',cx,cy+28);ctx.font='bold 22px system-ui';ctx.fillStyle=p[3];ctx.fillText('शुभ अवसर',cx,cy+82)}
}
ctx.restore();ctx.strokeStyle=p[3];ctx.lineWidth=5;ctx.beginPath();ctx.arc(cx,cy,r+14,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=p[2];ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r+24,0,Math.PI*2);ctx.stroke();
// event dates and identity
if(occ.dates){ctx.fillStyle=p[2];ctx.font=`700 ${fitText(occ.dates,w-85,22,'700')}px system-ui`;ctx.fillText(occ.dates,w/2,625)}
const name=$('personName').value.trim()||'आपका नाम';let nameSize=Number($('fontSize').value)||36;nameSize=fitText(name,w-170,nameSize,'800');ctx.font=`800 ${nameSize}px system-ui`;ctx.fillStyle=p[2];ctx.fillText(name,w/2,735);
ctx.fillStyle=p[3];ctx.font='600 23px system-ui';ctx.fillText('की ओर से सादर शुभकामनाएँ',w/2,779);
// user photo is now a smaller side portrait, not replacing the event's main artwork
if(photo){const ux=w-135,uy=875,ur=70;ctx.save();ctx.shadowColor=p[2];ctx.shadowBlur=24;ctx.fillStyle=p[2];ctx.beginPath();ctx.arc(ux,uy,ur+8,0,Math.PI*2);ctx.fill();ctx.restore();ctx.save();ctx.beginPath();ctx.arc(ux,uy,ur,0,Math.PI*2);ctx.clip();drawCover(photo,ux-ur,uy-ur,ur*2,ur*2);ctx.restore();ctx.strokeStyle=p[3];ctx.lineWidth=4;ctx.beginPath();ctx.arc(ux,uy,ur+9,0,Math.PI*2);ctx.stroke();ctx.textAlign='center';ctx.fillStyle=p[3];ctx.font='600 15px system-ui';ctx.fillText('आपकी फोटो',ux,uy+ur+29)}
const msg=$('wishText').value.trim()||occ.message;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='500 24px system-ui';const words=msg.split(/\s+/);let lines=[],line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>w-115&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);lines.slice(0,4).forEach((ln,i)=>ctx.fillText(ln,w/2,900+i*38));
// lighting streaks and petals/sparkles for reel
const anim=$('animationSelect').value;for(let i=0;i<24;i++){let x=(i*79+Math.sin(time/400+i*3)*45+w)%w,y=((i*97+time*(anim==='rise'?.045:.025))%(h+100))-50;ctx.globalAlpha=.55;ctx.fillStyle=anim==='petals'?'#ffd5e8':p[2];if(anim==='petals'){ctx.save();ctx.translate(x,y);ctx.rotate(time/900+i);ctx.beginPath();ctx.ellipse(0,0,7,13,0,0,Math.PI*2);ctx.fill();ctx.restore()}else if(anim==='sparkle'){ctx.font='20px serif';ctx.fillText('✦',x,y)}else if(anim==='rise'){ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
ctx.fillStyle=p[2];ctx.font='700 18px system-ui';ctx.fillText('स्नेह • सम्मान • शुभकामनाएँ',w/2,h-85);ctx.font='14px system-ui';ctx.fillStyle=p[3];ctx.fillText('शुभ अवसर क्रिएटर',w/2,h-53);
}
function render(){drawPoster();posterReady=true;$('emptyState').hidden=true;$('downloadWebm').disabled=!videoBlob;}
$('photoInput').addEventListener('change',e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){status('कृपया सही image file चुनें।');return}if(file.size>15*1024*1024){status('फोटो 15 MB से छोटी चुनें।');return}const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{photo=img;render();status('फोटो तैयार है। अब पोस्टर या वीडियो रील बनाएँ।');URL.revokeObjectURL(url)};img.onerror=()=>status('फोटो नहीं खुली। दूसरी फोटो चुनें।');img.src=url;});
$('occasionSelect').addEventListener('change',()=>{const o=occasions[$('occasionSelect').value]||occasions.today;$('wishText').value=o.message;$('themeSelect').value=o.theme;$('customTitleWrap').hidden=$('occasionSelect').value!=='custom';loadEventPortrait();if(photo)render()});
loadEventPortrait();
['personName','wishText','themeSelect','frameSelect','fontSize','animationSelect','customTitle'].forEach(id=>$(id).addEventListener('input',()=>{if(photo)render()}));
$('makePoster').addEventListener('click',()=>{if(!photo){status('पहले अपनी फोटो चुनें।');return}render();status('पोस्टर तैयार है। नीचे PNG या JPG डाउनलोड करें।')});
function download(blob,name){if(!blob){status('पहले पोस्टर या वीडियो तैयार करें।');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
$('downloadPng').addEventListener('click',()=>{if(!posterReady){status('पहले पोस्टर तैयार करें।');return}canvas.toBlob(b=>download(b,'shubh-avsar-poster.png'),'image/png')});
$('downloadJpg').addEventListener('click',()=>{if(!posterReady){status('पहले पोस्टर तैयार करें।');return}canvas.toBlob(b=>download(b,'shubh-avsar-poster.jpg'),'image/jpeg',.94)});
$('makeVideo').addEventListener('click',async()=>{if(!photo){status('पहले अपनी फोटो चुनें।');return}if(!canvas.captureStream||!window.MediaRecorder){status('इस ब्राउज़र में वीडियो रिकॉर्डिंग समर्थित नहीं है। Chrome का नया संस्करण आजमाएँ।');return}if(animationId)cancelAnimationFrame(animationId);videoBlob=null;chunks=[];try{render();stream=canvas.captureStream(25);let mime='video/webm;codecs=vp9';if(!MediaRecorder.isTypeSupported(mime))mime='video/webm';if(!MediaRecorder.isTypeSupported(mime)){status('इस ब्राउज़र में समर्थित वीडियो फॉर्मेट नहीं मिला।');stream.getTracks().forEach(t=>t.stop());return}recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:4500000});recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};recorder.onerror=()=>status('वीडियो बनाते समय त्रुटि हुई। पोस्टर डाउनलोड फिर भी कर सकते हैं।');recorder.onstop=()=>{videoBlob=new Blob(chunks,{type:mime});const url=URL.createObjectURL(videoBlob);$('videoPreview').src=url;$('videoPreview').hidden=false;$('downloadWebm').disabled=false;status('वीडियो रील तैयार है। डाउनलोड बटन दबाएँ।');stream.getTracks().forEach(t=>t.stop());if(animationId)cancelAnimationFrame(animationId)};const started=performance.now();function frame(now){drawPoster(now-started,true);if(recorder&&recorder.state==='recording'&&now-started<8000){animationId=requestAnimationFrame(frame)}else if(recorder&&recorder.state==='recording')recorder.stop()}recorder.start();animationId=requestAnimationFrame(frame);status('8 सेकंड की एनिमेटेड रील बनाई जा रही है…');}catch(err){console.error(err);status('वीडियो नहीं बन पाया: '+(err.message||'ब्राउज़र त्रुटि'))}});
$('downloadWebm').addEventListener('click',()=>download(videoBlob,'shubh-avsar-reel.webm'));
$('shareBtn').addEventListener('click',async()=>{if(!posterReady){status('पहले पोस्टर तैयार करें।');return}canvas.toBlob(async blob=>{try{if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],'shubh-avsar.png',{type:'image/png'})]})){await navigator.share({title:'शुभकामनाएँ',text:'मेरी शुभकामना पोस्टर',files:[new File([blob],'shubh-avsar.png',{type:'image/png'})]})}else{download(blob,'shubh-avsar.png');status('शेयर सपोर्ट नहीं है, पोस्टर डाउनलोड कर दिया गया।')}}catch(e){if(e.name!=='AbortError')status('शेयर नहीं हो पाया; पोस्टर डाउनलोड कर लें।')}},'image/png')});
$('year').textContent=new Date().getFullYear();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
})();
