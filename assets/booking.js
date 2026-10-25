(function () {
  'use strict';
  function todayTaipei() { return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Taipei', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date()); }
  function addDay(value) { const d=new Date(value+'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+1); return d.toISOString().slice(0,10); }
  function nights(a,b) { return Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000); }
  const form=document.getElementById('availability-form'); if(!form) return;
  const arrival=document.getElementById('checkin'), departure=document.getElementById('checkout');
  const children=document.getElementById('children'), ages=document.getElementById('child-ages');
  const error=document.getElementById('booking-error'), summary=document.getElementById('stay-summary');
  const roomLinks=Array.from(document.querySelectorAll('.booking-room-link'));
  function refreshRoomLinks() {
    const params=new URLSearchParams(new FormData(form));
    roomLinks.forEach(function(link) {
      const url=new URL(form.action);
      url.search=params.toString();
      url.hash='availability:~:text='+encodeURIComponent(link.dataset.type).replace(/-/g,'%2D');
      link.href=url.toString();
    });
  }
  roomLinks.forEach(function(link) {
    link.addEventListener('click',function(e) {
      if(!form.reportValidity()) {e.preventDefault();return;}
      validate(e);
      refreshRoomLinks();
    });
  });
  const today=todayTaipei(); arrival.min=today; arrival.value=today; departure.min=addDay(today); departure.value=addDay(today);
  function update() {
    departure.min=arrival.value ? addDay(arrival.value) : addDay(today);
    if(arrival.value && departure.value && departure.value<=arrival.value) departure.value=departure.min;
    const n=nights(arrival.value,departure.value);
    summary.textContent=Number.isFinite(n)&&n>0 ? n+' 晚 · '+document.getElementById('adults').value+' 位成人 · '+children.value+' 位兒童 · '+document.getElementById('room-count').value+' 間房' : '請選擇住宿日期';
    error.textContent='';
    refreshRoomLinks();
  }
  children.addEventListener('change',function(){
    const old=Array.from(ages.querySelectorAll('select')).map(x=>x.value); ages.replaceChildren();
    for(let i=0;i<Number(children.value);i++) {
      const label=document.createElement('label'); label.textContent='兒童 '+(i+1)+' 年齡';
      const select=document.createElement('select'); select.name='age'; select.required=true;
      select.add(new Option('請選擇年齡',''));
      for(let n=0;n<18;n++) select.add(new Option(n+' 歲',String(n)));
      select.value=old[i]||'';label.append(select); ages.append(label);
    } update();
  });
  form.addEventListener('change',update);
  function validate(e){
    if(!arrival.value||!departure.value||arrival.value<todayTaipei()||nights(arrival.value,departure.value)<1){e.preventDefault();error.textContent='請選擇今天以後的入住日期，退房日期需晚於入住日期。';arrival.focus();return;}
    if(Number(document.getElementById('room-count').value)>Number(document.getElementById('adults').value)){e.preventDefault();error.textContent='每間房請至少安排一位成人，請調整成人或客房數。';document.getElementById('adults').focus();}
  }
  form.addEventListener('submit',validate);
  const room=new URLSearchParams(location.search).get('room');
  const capacities={'101':2,'102':2,'103':2,'104':2,'105':2,'201':3,'202':2,'203':2,'204':6};
  if(Object.hasOwn(capacities,room)) {
    document.getElementById('adults').value=String(capacities[room]);
    const interest=document.getElementById('room-interest');interest.hidden=false;
    interest.textContent='您正在查詢 '+room+' 房型（標準入住 '+capacities[room]+' 人）。請在 Booking.com 比對房型與照片；指定房號請電話確認。';
  }
  update();
})();
