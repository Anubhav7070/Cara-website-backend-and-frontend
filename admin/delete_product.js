function deleteProduct(event) {
    event.preventDefault();

    const productID = document.getElementById('productID').value;

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