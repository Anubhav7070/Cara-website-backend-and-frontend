const express = require('express');
const fs = require('fs');
const path = require('path');
const multiparty = require('multiparty');

const imageRootPath = '../img/products/';
const indexFilePath = '../products_index.json';

const app = express();
const port = 3000;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Methods', 'PUT');
  // res.header('Access-Control-Allow-Methods', 'PUT, DELETE');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// ----------------- PUT/append -----------------
// Handle file + form fields for adding new product
app.put('/append', (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Form parsing error:', err);
      return res.status(500).json({ success: false, error: 'File parsing failed' });
    }

    // Get file
    const imageFile = files.productImageFile?.[0];
    if (!imageFile) return res.status(400).json({ success: false, error: 'No image uploaded' });

    const originalName = imageFile.originalFilename;
    const tempPath = imageFile.path;
    const destPath = path.join(imageRootPath, originalName);

    // Move file
    fs.copyFileSync(tempPath, destPath);

    // Load or initialize product index
    let jsonData = {};
    try {
      const data = fs.readFileSync(indexFilePath);
      jsonData = JSON.parse(data);
      if (!jsonData.hasOwnProperty('products'))
        jsonData['products'] = [];
    } catch {
      console.log("Error in parsing index file");
      jsonData['products'] = [];
    }

    // Create new entry from form fields
    const newEntry = {
      id: fields.addProductID?.[0] || '',
      name: fields.productName?.[0] || '',
      price: fields.productPrice?.[0] || '',
      image_file: originalName
    };

    jsonData.products.push(newEntry);
    console.log(jsonData.products);
    fs.writeFileSync(indexFilePath, JSON.stringify(jsonData, null, 2));

    res.json({ success: true });
  });
});

// ----------------- GET/products -----------------
app.get('/products', (req, res) => {
  try {
    const data = fs.readFileSync(indexFilePath);
    const jsonData = JSON.parse(data);
    const products = jsonData.products || [];

    const enrichedProducts = products.map(product => {
      const imgPath = path.join(imageRootPath, product.image_file || '');
      let base64Image = '';

      try {
        const imageBuffer = fs.readFileSync(imgPath);
        const mimeType = getMimeType(product.image_file);
        base64Image = `data:${mimeType};base64,` + imageBuffer.toString('base64');
      } catch (err) {
        console.error(`Error reading image ${imgPath}:`, err);
      }

      return {
        name: product.name,
        price: product.price,
        image_data: base64Image
      };
    });

    res.json(enrichedProducts);
  } catch (err) {
    console.error('Error reading index file:', err);
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// Utility to guess MIME type based on file extension
function getMimeType(filename) {
  const ext = path.extname(filename || '').toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}

// ----------------- DELETE/delete -----------------
app.delete('/delete', express.json(), (req, res) => {
  const productID = req.body.productID;
  
  if (!productID) {
    return res.status(400).json({ 
      success: false, 
      message: 'Product ID is required' 
    });
  }

  try {
    // Read the current products data
    const data = fs.readFileSync(indexFilePath);
    let jsonData = JSON.parse(data);
    
    if (!jsonData.hasOwnProperty('products')) {
      return res.status(404).json({ 
        success: false, 
        message: 'Products database not found' 
      });
    }
    
    // Find the product to delete
    const productIndex = jsonData.products.findIndex(product => 
      product.id === productID
    );
    
    if (productIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Store image filename before removing the product
    const imageFile = jsonData.products[productIndex].image_file;
    
    // Remove the product from the array
    jsonData.products.splice(productIndex, 1);
    
    // Write the updated data back to the file
    fs.writeFileSync(indexFilePath, JSON.stringify(jsonData, null, 2));
    
    // Delete the associated image file
    if (imageFile) {
      const imagePath = path.join(imageRootPath, imageFile);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Product successfully deleted' 
    });
    
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting product' 
    });
  }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));