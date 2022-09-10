let incremento = 1.1;
let arrayProductos = [];
let productos;
let producto;
let carrito = [];
let carritoStorage = [];
let precioTotal = 0;
let container = document.getElementById("container");
const apiKey = `dcacea55e6bce077bd20412a0dc1c31f`;
//Datos del clima.
const fetchData = position => {
  const {latitude, longitude} = position.coords;
  fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
  .then(response => response.json())
  .then(data => WeatherData(data))
};
const WeatherData = data => {
  let temperatura = document.getElementById("temperatura");
  temperatura.innerHTML = `La Temperatura en ${data.name} es de ${data.main.temp}°`
  if(Number(data.main.temp) > 15) {
    Swal.fire({
      title: 'Lindo día para comprar productos de verano! Te recomendamos:',
      showConfirmButton: false,
      timer: 2500,
      icon: 'success'
    });
    MercadoLibre("remeras");
  }else {
    Swal.fire({
      title: 'Que frío! A comprar productos de invierno! Te recomendamos:',
      showConfirmButton: false,
      timer: 2500,
      icon: 'success'
    });
    MercadoLibre("buzos");
  };
};
//Geolocalización.
const OnLoad = ()=> {
  navigator.geolocation.getCurrentPosition(fetchData);
};
//Api de github.
fetch('https://api.github.com/users/calderazzi')
.then((resp) => resp.json())
.then((data) => {
  let avatar = document.getElementById("avatar");
  let nombre = document.getElementById("nombre");
  avatar.innerHTML = `<img class="avatar" src="${data.avatar_url}">`;
  nombre.innerHTML = `<h4>${data.name}</h4>`
}).catch(error=> {
    Swal.fire("error");
  });
//Api Mercado Libre.
const MercadoLibre = async (ingreso) => {
  let response = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${ingreso}`);
  let data = await response.json();
  productos = data.results;
  container.innerHTML = "";
  arrayProductos = [];
  for(const prod of productos) {
    arrayProductos.push(prod);
  }
  for(const prodArr of arrayProductos){
    prodArr.price = prodArr.price * incremento;
    prodArr.price = prodArr.price.toFixed(2);
    let caja = document.createElement("div");
    caja.setAttribute("id", "contenedor");
    caja.innerHTML = `
    <div class="precio">
    <img src="${prodArr.thumbnail}">
    <p>$${prodArr.price}</p>
    <button id="btn${prodArr.id}" class="button">AGREGAR</button></div>
    <div class="nombre"><h2>${prodArr.title}</h2></div>`
    container.append(caja);
    let btnAgregar = document.getElementById(`btn${prodArr.id}`);
    btnAgregar.addEventListener(`click`, ()=> {
      CartAddProduct(prodArr);
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      Toastify({
        text: `Agregado al carrito!`,
        duration: 1500,
        position: 'right',
        gravity: "top",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
    }).showToast()
    })
  }
}
input.oninput = function() {
  let ingresos = input.value;
  MercadoLibre(ingresos);
};
//Carrito de compras.
function CartAddProduct(prod) {
  let estaEnCarrito = carrito.find(carro => carro.id === prod.id);
  if(estaEnCarrito) {
    estaEnCarrito.cantidad++;
    RefreshCart(estaEnCarrito);
    prod.price = Number(prod.price).toFixed(2);
    precioTotal += Number(prod.price);
    CartAdd();
    carritoStorage.push(estaEnCarrito);
  }else {    
    ShowCart(prod);
    let btnComprar = document.getElementById("btnComprar")
    btnComprar.addEventListener(`click`, ()=> {
      Buy();
    })
  }
}
//Crear carrito.
function ShowCart(prod) {
  let contenedorCarro = document.createElement("div");
    contenedorCarro.setAttribute("id", "content");
    let productoAgregar = prod;
    prod.price = Number(prod.price).toFixed(2);
    productoAgregar.cantidad = 1;
    carrito.push(productoAgregar);
    carritoStorage.push(productoAgregar);
  let div = document.createElement(`div`);
  div.setAttribute("id", "lista");
  div.innerHTML = `
  <p class="p" id="${prod.id}">${prod.cantidad}</p>
  <p class="p">${prod.title}</p>
  <p class="p" id="precio${prod.id}">$${prod.price}</p>
  <button class="btnEliminar" id="Eliminar${prod.id}"><i class="fa-solid fa-trash-can"></i></button>`;
  precioTotal += Number(prod.price);
  CartAdd();
document.getElementById("carroLista").appendChild(div);
DeleteProduct(productoAgregar);
}
//Borrar productos del carrito.
function DeleteProduct(prodCarrito) {
  let btnEliminar = document.getElementById(`Eliminar${prodCarrito.id}`);
  btnEliminar.addEventListener(`click`, ()=> {
    if(prodCarrito.cantidad > 1) {
      prodCarrito.cantidad--;
      RefreshCart(prodCarrito);
      precioTotal -= prodCarrito.price;
      CartAdd();
    }else {
      carrito = carrito.filter(item => item.id !== prodCarrito.id);
      btnEliminar.parentElement.remove();
      precioTotal -= prodCarrito.price;
      CartAdd();
    }
  })
}
//Actualizar cantidad y precios del carrito.
function RefreshCart(prod) {
  let multiplicacion = prod.price * prod.cantidad;
  multiplicacion = multiplicacion.toFixed(2);
  document.getElementById(`${prod.id}`).innerHTML = `<p class="p" id="${prod.id}">${prod.cantidad}</p>`;
  document.getElementById(`precio${prod.id}`).innerHTML = `<p class="p" id="precio${prod.id}">$${multiplicacion}</p>`;
}
//Sumar carrito.
function CartAdd() {
  SaveStorage();
  document.getElementById("carro").innerHTML = `<a class="carro" id="carro"><i class="fa-solid fa-cart-shopping" id="iconoCarrito"> Total: $${precioTotal.toFixed(2)}</i></a>`;
}
//Guardar en el storage el carrito.
function SaveStorage() {
  localStorage.setItem("carroOlvidado",JSON.stringify(carritoStorage));
};
//Carga del storage al carrito.
function VerifyStorage() {
  let arrayCarrito = JSON.parse(localStorage.getItem("carroOlvidado"));
  if(arrayCarrito) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toastify({
      text: 'Tu carrito te espera!',
      duration: 2000,
      position: 'right',
      gravity: "top",
      style: {
        background: "linear-gradient(to right, #b00000, #96c93d, #b00000)",
      },
  }).showToast()
    for(elemento of arrayCarrito ) {
      CartAddProduct(elemento);
    };
  };
  setTimeout(function(){
    localStorage.clear();
  },1900);
};
//Api de pago Mercado Pago.
const Buy = async () => {
  const productosToMap = carrito.map(Element => {
    let nuevoElemento = {
      title: Element.title,
      description: "",
      picture_url: Element.thumbnail,
      category_id: Number(Element.id),
      quantity: Element.cantidad,
      currency_id: "ARS",
      unit_price: Number(Element.price)
    }
    return nuevoElemento;
  })
  let response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: "Bearer TEST-348687998816585-090313-c1a3184333924d0fdf3f825dc97dcac8-134874245"
    },
    body: JSON.stringify({
      items: productosToMap
    })
  })
  let data = await response.json()
  console.log(data);
  window.open(data.init_point, "_blank");
}
OnLoad();
VerifyStorage();
