(()=>{
'use strict';
const $=id=>document.getElementById(id);
const canvas=$('posterCanvas'),ctx=canvas.getContext('2d');
let photo=null,posterReady=false,videoBlob=null,animationId=null,stream=null,recorder=null,chunks=[];
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
function drawPoster(time=0,forVideo=false){const w=canvas.width,h=canvas.height,occ=occasions[$('occasionSelect').value]||occasions.today,theme=$('themeSelect').value||occ.theme,p=themes[theme]||themes.gold,frame=$('frameSelect').value;
const grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,p[0]);grad.addColorStop(.55,p[1]);grad.addColorStop(1,p[0]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
// subtle decorative dots / particles
for(let i=0;i<65;i++){let x=(i*137+Math.sin(time/500+i)*22)%w,y=(i*211+(time/8*(i%3+1)))%h;ctx.globalAlpha=.12+(i%4)*.05;ctx.fillStyle=p[2];ctx.beginPath();ctx.arc(x,y,i%3+1,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
ctx.strokeStyle=p[2];ctx.lineWidth=frame==='minimal'?3:frame==='glow'?7:5;roundedRect(ctx,22,22,w-44,h-44,26);ctx.stroke();if(frame!=='minimal'){ctx.lineWidth=1.5;roundedRect(ctx,36,36,w-72,h-72,20);ctx.stroke();}
if(frame==='floral'||frame==='ornate'){for(const [x,y] of [[55,65],[w-55,65],[55,h-65],[w-55,h-65]]){ctx.font='40px serif';ctx.textAlign='center';ctx.fillText(frame==='floral'?'❀':'✦',x,y+10)}}
ctx.textAlign='center';ctx.fillStyle=p[2];ctx.font='bold 23px system-ui';ctx.fillText(occ.emoji||'✦',w/2,88);
const title=$('customTitle').value.trim()&&$('occasionSelect').value==='custom' ? $('customTitle').value.trim():occ.title;
ctx.fillStyle=p[3];let tsize=fitText(title,w-100,32,'800');ctx.font=`800 ${tsize}px system-ui`;ctx.fillText(title,w/2,145);
// photo circle
const cx=w/2,cy=390,r=190;
ctx.save();ctx.shadowColor=p[2];ctx.shadowBlur=frame==='glow'?32:12;ctx.fillStyle=p[2];ctx.beginPath();ctx.arc(cx,cy,r+9,0,Math.PI*2);ctx.fill();ctx.restore();ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();if(photo)drawCover(photo,cx-r,cy-r,r*2,r*2);else{ctx.fillStyle='#e8d8f8';ctx.fillRect(cx-r,cy-r,r*2,r*2);ctx.fillStyle='#6d4a8d';ctx.font='bold 24px system-ui';ctx.fillText('अपनी फोटो चुनें',cx,cy)}ctx.restore();ctx.strokeStyle=p[3];ctx.lineWidth=5;ctx.beginPath();ctx.arc(cx,cy,r+14,0,Math.PI*2);ctx.stroke();
const name=$('personName').value.trim()||'आपका नाम';let nameSize=Number($('fontSize').value)||36;nameSize=fitText(name,w-90,nameSize,'800');ctx.font=`800 ${nameSize}px system-ui`;ctx.fillStyle=p[2];ctx.fillText(name,w/2,650);
ctx.fillStyle=p[3];ctx.font='600 22px system-ui';ctx.fillText('की ओर से',w/2,692);
const msg=$('wishText').value.trim()||occ.message;ctx.fillStyle='#fff';ctx.font='500 25px system-ui';const words=msg.split(/\s+/);let lines=[],line='';for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>w-105&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);lines.slice(0,4).forEach((ln,i)=>ctx.fillText(ln,w/2,770+i*40));
if(occ.dates){ctx.fillStyle=p[2];ctx.font=`600 ${fitText(occ.dates,w-80,18,'600')}px system-ui`;ctx.fillText(occ.dates,w/2,970)}
// animated decoration
const anim=$('animationSelect').value;for(let i=0;i<18;i++){let x=(i*79+Math.sin(time/400+i*3)*35+w)%w,y=((i*97+time*(anim==='rise'?.045:.025))%(h+100))-50;ctx.globalAlpha=.55;ctx.fillStyle=anim==='petals'?'#ffd5e8':p[2];if(anim==='petals'){ctx.save();ctx.translate(x,y);ctx.rotate(time/900+i);ctx.beginPath();ctx.ellipse(0,0,7,13,0,0,Math.PI*2);ctx.fill();ctx.restore()}else if(anim==='sparkle'){ctx.font='20px serif';ctx.fillText('✦',x,y)}else if(anim==='rise'){ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
ctx.fillStyle=p[2];ctx.font='700 18px system-ui';ctx.fillText('स्नेह • सम्मान • शुभकामनाएँ',w/2,h-85);ctx.font='14px system-ui';ctx.fillStyle=p[3];ctx.fillText('शुभ अवसर क्रिएटर',w/2,h-53);
}
function render(){drawPoster();posterReady=true;$('emptyState').hidden=true;$('downloadWebm').disabled=!videoBlob;}
$('photoInput').addEventListener('change',e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){status('कृपया सही image file चुनें।');return}if(file.size>15*1024*1024){status('फोटो 15 MB से छोटी चुनें।');return}const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{photo=img;render();status('फोटो तैयार है। अब पोस्टर या वीडियो रील बनाएँ।');URL.revokeObjectURL(url)};img.onerror=()=>status('फोटो नहीं खुली। दूसरी फोटो चुनें।');img.src=url;});
$('occasionSelect').addEventListener('change',()=>{const o=occasions[$('occasionSelect').value]||occasions.today;$('wishText').value=o.message;$('themeSelect').value=o.theme;$('customTitleWrap').hidden=$('occasionSelect').value!=='custom';if(photo)render()});
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
