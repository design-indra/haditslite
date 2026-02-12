document.addEventListener("DOMContentLoaded", () => {

const bookList = document.getElementById("book-list");
const hadithView = document.getElementById("hadith-view");
const hadithContainer = document.getElementById("hadith-container");
const bookTitle = document.getElementById("book-title");
const backBtn = document.getElementById("backBtn");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");
const bookmarkBtn = document.getElementById("bookmarkPageBtn");
const bookmarkPage = document.getElementById("bookmark-page");
const bookmarkContainer = document.getElementById("bookmark-container");
const closeBookmark = document.getElementById("closeBookmark");

let currentBook = "";
let start = 1;
let loading = false;

/* THEME */
if(localStorage.getItem("theme")==="dark"){
  document.body.classList.add("dark");
  themeToggle.textContent="☀️";
}else{
  themeToggle.textContent="🌙";
}

themeToggle.onclick=()=>{
  document.body.classList.toggle("dark");
  const isDark=document.body.classList.contains("dark");
  themeToggle.textContent=isDark?"☀️":"🌙";
  localStorage.setItem("theme",isDark?"dark":"light");
};

/* FETCH BOOKS */
fetch("https://api.hadith.gading.dev/books")
.then(res=>res.json())
.then(data=>{
  data.data.forEach(book=>{
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`<strong>${book.name}</strong><br>Total: ${book.available}`;
    div.onclick=()=>loadHadith(book.id,book.name);
    bookList.appendChild(div);
  });
});

async function loadHadith(id,name){
  currentBook=id;
  bookTitle.textContent=name;
  bookList.classList.add("hidden");
  hadithView.classList.remove("hidden");
  hadithContainer.innerHTML="";
  start=1;
  fetchHadith();
}

async function fetchHadith(){
  if(loading) return;
  loading=true;

  const res=await fetch(`https://api.hadith.gading.dev/books/${currentBook}?range=${start}-${start+19}`);
  const data=await res.json();

  data.data.hadiths.forEach(h=>{
    const div=document.createElement("div");
    div.className="hadith-card";
    div.innerHTML=`
      <div class="arab">${h.arab}</div>
      <div class="translation">${h.id}</div>
      <div class="action-buttons">
        <button onclick="copyText(\`${h.arab}\`)">📋 Copy</button>
        <button onclick="shareHadith(\`${h.id}\`)">📤 Share</button>
        <button onclick="saveBookmark('${h.number}','${h.id}')">🔖 Save</button>
      </div>
    `;
    hadithContainer.appendChild(div);
  });

  start+=20;
  loading=false;
}

/* INFINITE SCROLL */
window.addEventListener("scroll",()=>{
  if(window.innerHeight+window.scrollY>=document.body.offsetHeight-100){
    fetchHadith();
  }
});

/* GLOBAL SEARCH */
searchInput.oninput=async(e)=>{
  const keyword=e.target.value;
  if(keyword.length<3) return;
  const res=await fetch(`https://api.hadith.gading.dev/search?q=${keyword}`);
  const data=await res.json();
  hadithContainer.innerHTML="";
  hadithView.classList.remove("hidden");
  bookList.classList.add("hidden");
  data.data.forEach(h=>{
    const div=document.createElement("div");
    div.className="hadith-card";
    div.innerHTML=`
      <div class="arab">${h.arab}</div>
      <div class="translation">${h.id}</div>
    `;
    hadithContainer.appendChild(div);
  });
};

/* BACK BUTTON */
backBtn.onclick=()=>{
  hadithView.classList.add("hidden");
  bookList.classList.remove("hidden");
};

/* BOOKMARK */
window.saveBookmark=(num,text)=>{
  let bookmarks=JSON.parse(localStorage.getItem("bookmarks"))||[];
  bookmarks.push({number:num,text:text});
  localStorage.setItem("bookmarks",JSON.stringify(bookmarks));
  alert("Disimpan!");
};

bookmarkBtn?.addEventListener("click",()=>{
  bookmarkPage.classList.remove("hidden");
  bookList.classList.add("hidden");
  hadithView.classList.add("hidden");
  loadBookmarks();
});

closeBookmark?.addEventListener("click",()=>{
  bookmarkPage.classList.add("hidden");
  bookList.classList.remove("hidden");
});

function loadBookmarks(){
  bookmarkContainer.innerHTML="";
  let bookmarks=JSON.parse(localStorage.getItem("bookmarks"))||[];
  bookmarks.forEach(b=>{
    const div=document.createElement("div");
    div.className="hadith-card";
    div.innerHTML=`<div class="translation">${b.text}</div>`;
    bookmarkContainer.appendChild(div);
  });
}

/* COPY */
window.copyText=(text)=>{
  navigator.clipboard.writeText(text);
  alert("Disalin!");
};

/* SHARE */
window.shareHadith=(text)=>{
  if(navigator.share){
    navigator.share({text:text});
  } else {
    alert("Share tidak didukung browser ini");
  }
};

/* SERVICE WORKER */
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}

});