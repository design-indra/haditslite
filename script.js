document.addEventListener("DOMContentLoaded", () => {

const bookList = document.getElementById("book-list");
const hadithView = document.getElementById("hadith-view");
const hadithContainer = document.getElementById("hadith-container");
const bookTitle = document.getElementById("book-title");
const backBtn = document.getElementById("backBtn");
const searchInput = document.getElementById("search");
const themeToggle = document.getElementById("themeToggle");
const bookmarkBtn = document.getElementById("bookmarkPageBtn");
const bookmarkPage = document.getElementById("bookmark-page");
const bookmarkContainer = document.getElementById("bookmark-container");
const closeBookmark = document.getElementById("closeBookmark");

let currentBook = "";
let start = 1;
let loading = false;
let totalAvailable = 0;

/* =========================
   THEME
========================= */

if(localStorage.getItem("theme")==="light"){
  document.body.classList.add("light");
  themeToggle.textContent="☀️";
}

themeToggle.onclick=()=>{
  document.body.classList.toggle("light");
  const light=document.body.classList.contains("light");
  themeToggle.textContent=light?"☀️":"🌙";
  localStorage.setItem("theme",light?"light":"dark");
};

/* =========================
   FETCH BOOKS
========================= */

fetch("https://api.hadith.gading.dev/books")
.then(res=>res.json())
.then(data=>{
  data.data.forEach(book=>{
    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`<strong>${book.name}</strong><br>Total: ${book.available}`;
    div.onclick=()=>loadHadith(book.id,book.name,book.available);
    bookList.appendChild(div);
  });
})
.catch(()=>alert("Gagal memuat daftar kitab"));

/* =========================
   LOAD HADITH
========================= */

function loadHadith(id,name,total){
  currentBook=id;
  totalAvailable = total;
  bookTitle.textContent=name;
  bookList.classList.add("hidden");
  hadithView.classList.remove("hidden");
  bookmarkPage.classList.add("hidden");
  hadithContainer.innerHTML="";
  start=1;
  fetchHadith();
}

async function fetchHadith(){
  if(loading) return;
  if(start > totalAvailable) return;

  loading=true;

  try{
    const res=await fetch(`https://api.hadith.gading.dev/books/${currentBook}?range=${start}-${start+19}`);
    const data=await res.json();

    data.data.hadiths.forEach(h=>{
      const div=document.createElement("div");
      div.className="hadith-card";

      div.innerHTML=`
        <div class="arab">${h.arab}</div>
        <div class="translation">${h.id}</div>
        <div class="action-buttons">
          <button class="copy-btn">📋 Copy</button>
          <button class="share-btn">📤 Share</button>
          <button class="save-btn">🔖 Save</button>
        </div>
      `;

      /* BUTTON EVENTS */
      div.querySelector(".copy-btn").onclick=()=>copyText(h.arab);
      div.querySelector(".share-btn").onclick=()=>shareHadith(h.id);
      div.querySelector(".save-btn").onclick=()=>saveBookmark(h.number,h.id);

      hadithContainer.appendChild(div);
    });

    start+=20;
  }catch{
    console.log("Gagal memuat hadits");
  }

  loading=false;
}

/* =========================
   INFINITE SCROLL (IMPROVED)
========================= */

window.addEventListener("scroll",()=>{
  if(loading) return;

  if((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 200){
    fetchHadith();
  }
});

/* =========================
   GLOBAL SEARCH
========================= */

let searchTimeout;

searchInput.oninput=(e)=>{
  clearTimeout(searchTimeout);

  searchTimeout=setTimeout(async()=>{
    const keyword=e.target.value.trim();
    if(keyword.length<3) return;

    try{
      const res=await fetch(`https://api.hadith.gading.dev/search?q=${keyword}`);
      const data=await res.json();

      hadithContainer.innerHTML="";
      hadithView.classList.remove("hidden");
      bookList.classList.add("hidden");
      bookmarkPage.classList.add("hidden");

      data.data.forEach(h=>{
        const div=document.createElement("div");
        div.className="hadith-card";
        div.innerHTML=`
          <div class="arab">${h.arab}</div>
          <div class="translation">${h.id}</div>
        `;
        hadithContainer.appendChild(div);
      });

    }catch{
      console.log("Search error");
    }

  },500);
};

/* =========================
   BOOKMARK (ANTI DUPLIKAT)
========================= */

function saveBookmark(num,text){
  let bookmarks=JSON.parse(localStorage.getItem("bookmarks"))||[];

  if(bookmarks.find(b=>b.number===num)){
    alert("Sudah ada di bookmark");
    return;
  }

  bookmarks.push({number:num,text:text});
  localStorage.setItem("bookmarks",JSON.stringify(bookmarks));
  alert("Disimpan!");
}

bookmarkBtn.onclick=()=>{
  bookmarkPage.classList.remove("hidden");
  bookList.classList.add("hidden");
  hadithView.classList.add("hidden");
  loadBookmarks();
};

closeBookmark.onclick=()=>{
  bookmarkPage.classList.add("hidden");
  bookList.classList.remove("hidden");
};

function loadBookmarks(){
  bookmarkContainer.innerHTML="";
  let bookmarks=JSON.parse(localStorage.getItem("bookmarks"))||[];

  if(bookmarks.length===0){
    bookmarkContainer.innerHTML="<p>Tidak ada bookmark.</p>";
    return;
  }

  bookmarks.forEach(b=>{
    const div=document.createElement("div");
    div.className="hadith-card";
    div.innerHTML=`
      <div class="translation">${b.text}</div>
    `;
    bookmarkContainer.appendChild(div);
  });
}

/* =========================
   COPY
========================= */

function copyText(text){
  navigator.clipboard.writeText(text)
  .then(()=>alert("Disalin!"))
  .catch(()=>alert("Gagal menyalin"));
}

/* =========================
   SHARE
========================= */

function shareHadith(text){
  if(navigator.share){
    navigator.share({text:text});
  } else {
    alert("Browser tidak mendukung fitur share");
  }
}

/* =========================
   SERVICE WORKER
========================= */

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}

});