const { response } = require("express");

// Logic to add a product to seller's list
function addProduct(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  console.log([...formData.entries()]);  // Debug: view form content

  fetch('http://localhost:3000/append', {
    method: 'PUT',
    body: formData // No headers — browser sets content-type automatically
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log("Entry successfully added");
        alert(`Product '${formData.get('productName')}' successfully added`);
      } else {
        console.log("Entry not added");
      }
    })
    .catch(error => {
      console.error(error);
    });
}

// Function to delete a product by ID
function deleteProduct(event) {
  event.preventDefault();
  
  const productID = document.querySelector('input[name="productID"]').value;
  
  if (!productID) {
    alert('Please enter a product ID');
    return;
  }
  
  // Confirm deletion
  if (!confirm(`Are you sure you want to delete product ID: ${productID}?`)) {
    return;
  }
  
  fetch('http://localhost:3000/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productID })
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log("Product successfully deleted");
        alert(`Product ID: ${productID} has been deleted`);
        // Clear the input field after successful deletion
        document.querySelector('input[name="productID"]').value = '';
      } else {
        console.error("Product deletion failed");
        alert(`Failed to delete product: ${result.message || 'Unknown error'}`);
      }
    })
    .catch(error => {
      console.error("Error deleting product:", error);
      alert("An error occurred while trying to delete the product");
    });
}