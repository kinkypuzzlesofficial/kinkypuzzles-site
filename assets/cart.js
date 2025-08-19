
// Simple cart using localStorage
const CART_KEY = 'kinkyCart';
function getCart(){return JSON.parse(localStorage.getItem(CART_KEY) || '[]');}
function saveCart(cart){localStorage.setItem(CART_KEY, JSON.stringify(cart));updateCartCount();}
function addToCart(id,name,price){const cart=getCart();const existing=cart.find(item=>item.id===id);if(existing){existing.qty+=1;}else{cart.push({id:id,name:name,price:price,qty:1});}saveCart(cart);alert('Added '+name+' to cart');}
function removeFromCart(id){let cart=getCart().filter(item=>item.id!==id);saveCart(cart);displayCart();}
function updateCartCount(){const countElem=document.getElementById('cart-count');if(countElem){const count=getCart().reduce((t,i)=>t+i.qty,0);countElem.textContent=count;}}
function displayCart(){const table=document.getElementById('cart-table');const tbody=table.querySelector('tbody');tbody.innerHTML='';const cart=getCart();let total=0;cart.forEach(item=>{const row=document.createElement('tr');row.innerHTML=`<td>${item.name}</td><td>${item.qty}</td><td>$${(item.price*item.qty).toFixed(2)}</td><td><button onclick="removeFromCart('${item.id}')">Remove</button></td>`;tbody.appendChild(row);total+=item.price*item.qty;});document.getElementById('cart-total').textContent=cart.length?'$'+total.toFixed(2):'$0.00';
  if(document.getElementById('paypal-button-container')){
    if(!window.paypalLoaded){
      const script=document.createElement('script');
      script.src='https://www.paypal.com/sdk/js?client-id=sb&currency=USD';
      script.onload=function(){window.paypalLoaded=true;renderPayPal(total);} ;
      document.body.appendChild(script);
    } else {renderPayPal(total);}
  }
}
function renderPayPal(total){if(!window.paypal) return;paypal.Buttons({
  createOrder: function(data,actions){ return actions.order.create({ purchase_units:[{ amount:{ value: total.toFixed(2) } }] }); },
  onApprove: function(data,actions){ return actions.order.capture().then(function(details){ alert('Transaction completed by '+details.payer.name.given_name); localStorage.removeItem(CART_KEY); displayCart(); }); }
}).render('#paypal-button-container');}
document.addEventListener('DOMContentLoaded',()=>{updateCartCount();if(document.getElementById('cart-table')) displayCart();});
