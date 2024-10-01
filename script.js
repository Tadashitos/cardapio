const menu = document.getElementById('menu')
const cartBtn = document.getElementById('cart-btn')
const cartModal = document.getElementById('cart-modal')
const cartItemsContainer = document.getElementById('cart-items')
const cartTotal = document.getElementById('cart-total')
const checkoutBtn = document.getElementById('checkout-btn')
const closeModalBtn = document.getElementById('close-modal-btn')
const cartCounter = document.getElementById('cart-count')
const addressInput = document.getElementById('address')
const addressWarn = document.getElementById('address-warn')
const spanItem = document.getElementById('date-span')

// Lista de itens do carrinho
let cart = []

// Abrir modal do carrinho
cartBtn.addEventListener("click", () => {
    updateCartModal()
    cartModal.style.display = "flex"
})

// Fechar modal quando clicar fora do mesmo
cartModal.addEventListener("click", event => {
    if(event.target === cartModal) cartModal.style.display = "none"
})

// Fechar modal quando clicar no botão "Fechar"
closeModalBtn.addEventListener("click", () => cartModal.style.display = "none")

// Adicionar item no carrinho
menu.addEventListener("click", event => {
    let parentButton = event.target.closest(".add-to-cart-btn") // O método closest() retorna o "ancestral" mais próximo em relação ao elemento atual clicado. Neste caso, se eu clicar no ícone dentro do botão, ele retorna o botão, visto que é o "ancestral" mais próximo que contém a classe "add-to-cart-btn"

    if(parentButton) {
        const name = parentButton.getAttribute("data-name")
        const price = parseFloat(parentButton.getAttribute("data-price"))

        addToCart(name, price)
    }
})

// Função para adicionar no carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name)

    if(existingItem) {
        existingItem.quantity += 1
    } else {
        cart.push({ name, price, quantity: 1 })
    }

    updateCartModal()
}

// Função para atualizar carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = ""
    let total = 0

    cart.forEach(item => {
        const cartItemElement = document.createElement("div")
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col")

        cartItemElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p>Qtde: ${item.quantity}</p>
                    <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
                </div>

                <button class="remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
            </div>
        `

        total += item.price * item.quantity

        cartItemsContainer.appendChild(cartItemElement)
    })

    cartTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

    cartCounter.innerText = cart.length
}

// Clicando no botão "Remover"
cartItemsContainer.addEventListener("click", event => {
    if(event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name")

        removeItemCart(name)
    }
})

// Função para remover item do carrinho
function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name) // O findIndex() só retorna -1 quando ele NÃO encontra o item especificado na lista

    if(index !== -1) {
        const item = cart[index]
        
        if(item.quantity > 1) {
            item.quantity -= 1
            updateCartModal()
            return
        }

        cart.splice(index, 1)
        updateCartModal()
    }
}

// Verificação do input
addressInput.addEventListener("input", event => {
    let inputValue = event.target.value

    if(inputValue !== "") {
        addressInput.classList.remove("border-red-500")
        addressWarn.classList.add("hidden")
    }
})

// Verificação do botão de "Finalizar pedido"
checkoutBtn.addEventListener("click", () => {
    const isOpen = checkRestaurantOpen()

    if(!isOpen) {
        Toastify({
            text: "Ops! O restaurante está fechado!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
              background: "#ef4444",
            },
            onClick: function(){} // Callback after click
        }).showToast();

        return
    }

    if(cart.length === 0) return

    if(addressInput.value === "") {
        addressWarn.classList.remove("hidden")
        addressInput.classList.add("border-red-500")
        return
    }

    // Enviar o pedido para Api WhatsApp
    const cartItems = cart.map(item => {
        return (
            ` ${item.name} Quantidade: (${item.quantity}) Preço: R$ ${item.price.toFixed(2)} |`
        )
    }).join("")

    const message = encodeURIComponent(cartItems)
    const phone = "11966459779"
    
    window.open(`https://wa.me/${phone}?text=${message} Endereço: ${addressInput.value}`, "_blank")

    cart = []
    updateCartModal()
})

// Verificar a hora e manipular o card do horário de funcionamento
function checkRestaurantOpen() {
    const data = new Date()
    const hora = data.getHours()

    return hora >= 18 && hora < 22 // True = restaurante aberto | False = restaurante fechado
}

const isOpen = checkRestaurantOpen()

if(isOpen) {
    spanItem.classList.remove("bg-red-500")
    spanItem.classList.add("bg-green-600")
} else {
    spanItem.classList.remove("bg-green-600")
    spanItem.classList.add("bg-red-500")
}