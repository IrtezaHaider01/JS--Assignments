const products = [
  {id:1,name:"Sculptural Ceramic Vase",price:4850,category:"Home Decor",rating:4.8,reviews:124,image:"https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=800&q=85",description:"A softly sculpted ceramic vase with an organic silhouette. Beautiful on its own or styled with seasonal stems."},
  {id:2,name:"Everyday Canvas Tote",price:2200,category:"Accessories",rating:4.3,reviews:86,image:"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=85",description:"A roomy everyday tote made for market mornings, commutes and everything in between."},
  {id:3,name:"Minimal Desk Lamp",price:7950,category:"Lighting",rating:4.7,reviews:98,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=85",description:"A clean-lined lamp that brings a warm, focused glow to your favourite corner." },
  {id:4,name:"Linen Cushion Cover",price:1850,category:"Home Decor",rating:4.1,reviews:63,image:"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=85",description:"Textured linen with a relaxed finish, designed to layer effortlessly into your home."},
  {id:5,name:"Classic Analog Watch",price:12500,category:"Accessories",rating:4.9,reviews:211,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85",description:"A timeless everyday watch with a pared-back face and considered details."},
  {id:6,name:"Amber Glass Candle",price:1650,category:"Home Decor",rating:3.8,reviews:47,image:"https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=85",description:"A warm ambient candle in reusable amber glass, perfect for slow evenings."},
  {id:7,name:"Arc Table Light",price:9200,category:"Lighting",rating:4.5,reviews:72,image:"https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&w=800&q=85",description:"A sculptural light with a soft presence and a practical, focused glow."},
  {id:8,name:"Soft Knit Throw",price:5400,category:"Textiles",rating:4.6,reviews:105,image:"https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=800&q=85",description:"A cosy, tactile throw for the sofa, reading chair or the end of your bed."},
  {id:9,name:"Stoneware Coffee Cup",price:1250,category:"Kitchen",rating:3.6,reviews:39,image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=85",description:"A hand-feel stoneware cup for your daily coffee ritual."},
  {id:10,name:"Weekend Crossbody",price:3650,category:"Accessories",rating:2.9,reviews:28,image:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=85",description:"A compact crossbody bag that keeps your essentials close and your hands free."},
  {id:11,name:"Woven Serving Tray",price:2750,category:"Kitchen",rating:4.2,reviews:54,image:"https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=85",description:"A versatile woven tray for serving, styling and keeping small things in order."},
  {id:12,name:"Cotton Bath Towel",price:1950,category:"Textiles",rating:1.8,reviews:17,image:"https://images.unsplash.com/photo-1600369672770-985fd30004eb?auto=format&fit=crop&w=800&q=85",description:"An absorbent cotton towel with a simple, timeless finish."}
];

const $ = id => document.getElementById(id);
const categories = [...new Set(products.map(product => product.category))].sort();
const state = {categories:new Set(), min:null, max:null, rating:0, search:"", sort:"default", visible:6, cart:0};
const money = amount => "Rs. " + amount.toLocaleString("en-PK");
const stars = rating => "★★★★★".slice(0,Math.round(rating)) + "☆☆☆☆☆".slice(0,5-Math.round(rating));

function renderCategories(){
  $("categoryOptions").innerHTML = categories.map(category => {
    const count = products.filter(product => product.category === category).length;
    return `<label><input type="checkbox" value="${category}" ${state.categories.has(category)?"checked":""}><span>${category}</span><span>${count}</span></label>`;
  }).join("");
  $("categoryOptions").querySelectorAll("input").forEach(input => input.addEventListener("change",()=>{
    input.checked ? state.categories.add(input.value) : state.categories.delete(input.value);
    state.visible=6; render();
  }));
}

function getFilteredProducts(){
  let result = products.filter(product => {
    const categoryMatch = state.categories.size === 0 || state.categories.has(product.category);
    const priceMatch = (state.min === null || product.price >= state.min) && (state.max === null || product.price <= state.max);
    const ratingMatch = product.rating >= state.rating;
    const searchMatch = product.name.toLowerCase().includes(state.search.toLowerCase());
    return categoryMatch && priceMatch && ratingMatch && searchMatch;
  });
  const sorters = {
    "price-asc":(a,b)=>a.price-b.price, "price-desc":(a,b)=>b.price-a.price,
    "rating-asc":(a,b)=>a.rating-b.rating, "rating-desc":(a,b)=>b.rating-a.rating,
    "name-asc":(a,b)=>a.name.localeCompare(b.name), "name-desc":(a,b)=>b.name.localeCompare(a.name)
  };
  if(sorters[state.sort]) result.sort(sorters[state.sort]);
  return result;
}

function render(){
  const filtered = getFilteredProducts();
  $("resultCount").textContent = filtered.length;
  $("priceRangeLabel").textContent = `${state.min===null?"Rs. 0":money(state.min)} — ${state.max===null?"No limit":money(state.max)}`;
  $("productGrid").innerHTML = filtered.slice(0,state.visible).map(product => `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <button class="quick-view" data-detail="${product.id}">Quick view</button>
      </div>
      <div class="product-meta"><h3 class="product-name">${product.name}</h3><span class="product-price">${money(product.price)}</span></div>
      <p class="product-category">${product.category}</p>
      <p class="rating" aria-label="${product.rating} out of 5 stars">${stars(product.rating)} <span>${product.rating.toFixed(1)} (${product.reviews})</span></p>
      <button class="add-button" data-add="${product.id}">Add to bag +</button>
    </article>`).join("");
  $("emptyState").hidden = filtered.length !== 0;
  $("productGrid").hidden = filtered.length === 0;
  $("loadMore").hidden = filtered.length <= state.visible;
  renderBadges();
}

function renderBadges(){
  const badges = [];
  state.categories.forEach(category=>badges.push({label:category,remove:()=>{state.categories.delete(category);renderCategories();render();}}));
  if(state.min!==null || state.max!==null) badges.push({label:`Price: ${state.min??0}–${state.max??"Any"}`,remove:()=>{state.min=null;state.max=null;$("minPrice").value="";$("maxPrice").value="";render();}});
  if(state.rating) badges.push({label:`${state.rating}+ stars`,remove:()=>{state.rating=0;document.querySelector('input[name="rating"][value="0"]').checked=true;render();}});
  if(state.search) badges.push({label:`Search: ${state.search}`,remove:()=>{state.search="";$("searchInput").value="";render();}});
  $("activeFilters").innerHTML = badges.map((badge,index)=>`<button class="filter-chip" data-remove="${index}">${badge.label}<span>×</span></button>`).join("");
  $("activeFilters").querySelectorAll("button").forEach((button,index)=>button.addEventListener("click",()=>{badges[index].remove();}));
}

function clearAll(){
  state.categories.clear();state.min=null;state.max=null;state.rating=0;state.search="";state.sort="default";state.visible=6;
  $("minPrice").value="";$("maxPrice").value="";$("searchInput").value="";$("sortSelect").value="default";
  document.querySelector('input[name="rating"][value="0"]').checked=true;
  renderCategories();render();
}

let toastTimer;
function showToast(message){$("toast").textContent=message;$("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2100);}
function addToCart(id){const product=products.find(item=>item.id===id);state.cart++;$("cartCount").textContent=state.cart;showToast(`${product.name} added to your bag`);}

function openDetails(id){
  const product=products.find(item=>item.id===id);if(!product)return;
  $("modalImage").src=product.image;$("modalImage").alt=product.name;$("modalCategory").textContent=product.category;
  $("modalName").textContent=product.name;$("modalRating").textContent=`${stars(product.rating)}  ${product.rating.toFixed(1)} / 5`;
  $("modalPrice").textContent=money(product.price);$("modalDescription").textContent=product.description;
  $("modalAdd").dataset.add=product.id;$("productModal").hidden=false;document.body.style.overflow="hidden";
}
function closeDetails(){$("productModal").hidden=true;document.body.style.overflow="";}

$("minPrice").addEventListener("change",e=>{state.min=e.target.value===""?null:Math.max(0,Number(e.target.value));if(state.max!==null&&state.min!==null&&state.min>state.max){state.max=state.min;$("maxPrice").value=state.max;}state.visible=6;render();});
$("maxPrice").addEventListener("change",e=>{state.max=e.target.value===""?null:Math.max(0,Number(e.target.value));if(state.min!==null&&state.max!==null&&state.max<state.min){state.min=state.max;$("minPrice").value=state.min;}state.visible=6;render();});
document.querySelectorAll('input[name="rating"]').forEach(input=>input.addEventListener("change",()=>{state.rating=Number(input.value);state.visible=6;render();}));
$("searchInput").addEventListener("input",e=>{state.search=e.target.value.trim();state.visible=6;render();});
$("sortSelect").addEventListener("change",e=>{state.sort=e.target.value;render();});
$("clearAll").addEventListener("click",clearAll);$("emptyClear").addEventListener("click",clearAll);
$("clearCategories").addEventListener("click",()=>{state.categories.clear();renderCategories();render();});
$("loadMore").addEventListener("click",()=>{state.visible+=6;render();});
$("productGrid").addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");const detail=e.target.closest("[data-detail]");
  if(add){e.stopPropagation();addToCart(Number(add.dataset.add));}
  else if(detail)openDetails(Number(detail.dataset.detail));
  else {const card=e.target.closest(".product-card");if(card)openDetails(Number(card.dataset.id));}
});
$("modalAdd").addEventListener("click",e=>{addToCart(Number(e.currentTarget.dataset.add));closeDetails();});
$("modalClose").addEventListener("click",closeDetails);
$("productModal").addEventListener("click",e=>{if(e.target===$("productModal"))closeDetails();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDetails();});
$("cartButton").addEventListener("click",()=>showToast(`Your bag has ${state.cart} item${state.cart===1?"":"s"}`));

renderCategories();render();