/* Logic for adding items to the 'shop' page from the updated 'products_index.json' index file and the saved images (and potentially other data). This script will run only once per load (although not recommended).
Sample div entry:
<div class="pro" data-name="Flower Print T-Shirts" data-brand="adidas" data-price="2499" data-category="t-shirt" data-tags="floral,summer,casual">
    <img class="shirt" src="img/products/f2.jpg" alt="">
    <div class="des">
        <span>adidas</span>
        <h5>Flower Print T-Shirts</h5>
        <div class="star">
            <i class='bx bxs-star' ></i>
            <i class='bx bxs-star' ></i>
            <i class='bx bxs-star' ></i>
            <i class='bx bxs-star' ></i>
            <i class='bx bxs-star' ></i>
        </div>
        <h4>₹2499</h4>
        <div class="tags">
            <span class="product-tag">floral</span>
            <span class="product-tag">summer</span>
        </div>
    </div>
    <a href="#"><i class='bx bx-cart cart' ></i></a>
</div> */

// const fs = require('fs');

// section where items are to be added
const displaySection = document.getElementById('product-container');

// function fetchItemsFromJSON(path) {
//     fetch(path, {
//         method: 'GET'
//     })
//     .then(response => {
//         console.log(response);
//         if (!response.ok)
//             console.log("Error in reading from index file");
//         else {
//             console.log(response.statusText);
//             return response.json();
//         }
//     });
// }

async function displayFetchedItems() {
    // fetchItemsFromJSON('http://localhost:3000/products')
    fetch('http://localhost:3000/products', {
        method: 'GET'
    })
    .then(response => {
        console.log(response);
        if (!response.ok)
            console.log("Error in reading from index file");
        else {
            console.log(response.statusText);
            return response.json();
        }
    })
    .then(items => {
        console.log(items);
        // console.log(Array(items));

        // Image: <img src={items[i].image_data}>
        items.forEach(item => {
            const divElem = document.createElement('div');
            divElem.className = 'pro';
            divElem.dataset.name = item.name;
            divElem.dataset.brand = item.name.split("Default");
            divElem.dataset.price = item.price;

            // Adding image
            const img = document.createElement('img');
            img.className = 'shirt';
            img.src = item.image_data;
            img.alt = 'T-Shirt';

            // Added later
            // Description div
            const desDiv = document.createElement('div');
            desDiv.className = 'des';

            const brandSpan = document.createElement('span');
            brandSpan.textContent = 'Default';

            const title = document.createElement('h5');
            title.textContent = item.name;

            const stars = document.createElement('div');
            stars.className = 'star';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('i');
                star.className = 'bx bxs-star';
                stars.appendChild(star);
            }

            const price = document.createElement('h4');
            price.textContent = `₹${item.price}`;

            const tagDiv = document.createElement('div');
            tagDiv.className = 'tags';
            // item.tags.slice(0, 2).forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'product-tag';
                tagSpan.textContent = 'new';
                tagDiv.appendChild(tagSpan);
            // });

            // Build description
            desDiv.appendChild(brandSpan);
            desDiv.appendChild(title);
            desDiv.appendChild(stars);
            desDiv.appendChild(price);
            desDiv.appendChild(tagDiv);

            // Cart icon link
            const cartLink = document.createElement('a');
            cartLink.href = '#';
            const cartIcon = document.createElement('i');
            cartIcon.className = 'bx bx-cart cart';
            cartLink.appendChild(cartIcon);

            // Assemble final product div
            divElem.appendChild(img);
            divElem.appendChild(desDiv);
            divElem.appendChild(cartLink);

            // Append to page
            displaySection.appendChild(divElem);
        });
    });
}

try {
    displayFetchedItems();
} catch (e) {
    console.log("Encountered error");
    console.log(e);
}