PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      email_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO users VALUES(1,'admin@shopflow.com','$2a$10$AEFOuOFN1LaUIbAbxf7jze/1A4EDeLXcZgG4537V7hg/VE8WmRvXG','Admin User',NULL,NULL,'admin',1,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO users VALUES(2,'customer@example.com','$2a$10$RukKF/KokIZe/1mz6WwCuegp.azgOWigFfiCXHz1SGc222qcTvkjW','Test Customer',NULL,NULL,'customer',1,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO users VALUES(3,'demo.google@example.com','$2a$10$ctEaVRD7N93tXCUg9bTbv.COSMdFV.Xe2GjPhvPdQOZsNn/u0Z3VC','Demo Google User',NULL,'https://via.placeholder.com/150','customer',1,'2025-12-12 18:08:36','2025-12-12 18:08:36');
INSERT INTO users VALUES(4,'test@example.com','$2a$10$XKNDOBZuoqBCz2fkdYBnbehFvSLQsssxl4/tRfYhKCmUojIbvpmwe','Test User',NULL,NULL,'customer',0,'2025-12-13 01:05:02','2025-12-13 01:05:02');
INSERT INTO users VALUES(5,'test2@example.com','$2a$10$lbdZDMMYmiH.UEQh7N8ge.jRNILv0cKyXqSsvSv/Ro/boEtkSE9wS','Test User 2',NULL,NULL,'customer',1,'2025-12-13 01:06:23','2025-12-13 01:06:32');
INSERT INTO users VALUES(6,'test3@example.com','$2a$10$xC6mbE.AOWJla./b2.bf9OdN4Qq3FlLowbDqGnbV2WFtADOh8.MJa','Test User 3',NULL,NULL,'customer',1,'2025-12-13 01:07:06','2025-12-13 01:07:22');
INSERT INTO users VALUES(7,'test4@example.com','$2a$10$BR5K1ZwZ1.IFAvQh4bfAwO6yLIvRMGGtMhzUeYkbvTllASBJDgIvC','Test User 4',NULL,NULL,'customer',0,'2025-12-13 01:07:48','2025-12-13 01:07:48');
INSERT INTO users VALUES(8,'test5@example.com','$2a$10$YSy.hgaaY2aSbLyBpFpRlu6fhn6Syxy2LpTp154TLu/bg3cLL1qGG','Test User 5',NULL,NULL,'customer',1,'2025-12-13 01:12:41','2025-12-13 01:12:58');
INSERT INTO users VALUES(9,'test6@example.com','$2a$10$fGg2wOzuLxauLu0cctavlOLWnjhdYclHsuZx/0sON7quMnFF.aDnG','Test User 6',NULL,NULL,'customer',0,'2025-12-13 01:13:22','2025-12-13 01:13:22');
INSERT INTO users VALUES(10,'testuser@example.com','$2a$10$gV80u2HIyILzMvYvpMIGIuWY3FCwUF0n.bmeS2pgDsRrCe4AEYbBW','Test User',NULL,NULL,'customer',1,'2025-12-13 04:23:06','2025-12-13 04:23:15');
INSERT INTO users VALUES(11,'admin@example.com','$2a$10$oarwImZi8AReXXRFmV4uZ.tHm3/2vSasuNCtP2/KGwAMZJnoNmB5O','Admin User',NULL,NULL,'admin',1,'2025-12-13 04:24:45','2025-12-13 04:25:04');
INSERT INTO users VALUES(12,'testuser2@example.com','$2a$10$cA5EfAHqFUSYz/9l9fircuCNpz3jau5GXMtvV/KXAPJlXtphs/2ci','Test User 2',NULL,NULL,'customer',0,'2025-12-13 05:51:39','2025-12-13 05:51:39');
INSERT INTO users VALUES(13,'testuser_1765607811@example.com','$2a$10$FcPwbJb/4pTyb6b5SszxQOUctJGElu4qINekkRupyW1NKOMO2cRa6','Test User',NULL,NULL,'customer',0,'2025-12-13 06:36:51','2025-12-13 06:36:51');
INSERT INTO users VALUES(14,'testuser12345@example.com','$2a$10$BvP9fnTYumeMg42b9vx0YOvCRZ174/eie2ecZJ1bjgtoND8OQkF7C','Test User',NULL,NULL,'customer',0,'2025-12-13 06:50:42','2025-12-13 06:50:42');
INSERT INTO users VALUES(15,'testuser_1765610199@example.com','$2a$10$5jT/x.Fuly1HEMBi9VQYFu91jbol7EJ/d/bELbvMHwHT.3/V7R3ia','Test User 1765610199',NULL,NULL,'customer',0,'2025-12-13 07:16:39','2025-12-13 07:16:39');
INSERT INTO users VALUES(16,'newuser@example.com','$2a$10$4wZyVnGcujOM0JkxaQ539.U/5WupMG/IMKofTfVmkxPzZ/2qRBW/S','New User',NULL,NULL,'customer',0,'2025-12-13 09:42:48','2025-12-13 09:42:48');
INSERT INTO users VALUES(17,'newtest@example.com','$2a$10$NgMfu985KAPuew8UUXSS0.WTNckIkKBH1CO/rRpOofGVQjaPIrNui','New Test User',NULL,NULL,'customer',1,'2025-12-13 10:17:49','2025-12-13 10:18:00');
INSERT INTO users VALUES(18,'newtestuser@example.com','$2a$10$OjkzNaqomqqo.DnLD2icGeEUPB2PAV.iUIPsmLecquaS4Ft7EBCC6','New Test User',NULL,NULL,'customer',0,'2025-12-13 10:30:36','2025-12-13 10:30:36');
CREATE TABLE addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      street_address TEXT NOT NULL,
      apartment TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL,
      phone TEXT,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
INSERT INTO addresses VALUES(1,1,'Home','Bowen','Li','72 Burns Road',NULL,'Kellyville','AK','12345','United States','0288831816',0,'2025-12-14 06:46:47');
INSERT INTO addresses VALUES(2,1,'Home','Bowen','Li','72 Burns Road',NULL,'Kellyville','AK','12345','United States','0288831816',0,'2025-12-14 06:47:01');
INSERT INTO addresses VALUES(3,1,'Home','Bowen','Li','72 Burns Road',NULL,'Kellyville','AK','12345','United States','0288831816',0,'2025-12-14 06:47:04');
INSERT INTO addresses VALUES(4,1,'Home','Bowen','Li','72 Burns Road',NULL,'Kellyville','AK','12345','United States','0288831816',1,'2025-12-14 11:19:36');
INSERT INTO addresses VALUES(5,1,'Home','Bowen','Li','72 Burns Road',NULL,'Kellyville','AK','12345','Australia','0288831816',0,'2025-12-14 11:20:16');
INSERT INTO addresses VALUES(6,1,'Work','John','Doe','123 Main Street',NULL,'New York','NY','10001','United States','5551234567',0,'2025-12-14 12:13:32');
INSERT INTO addresses VALUES(7,2,'Home','Bowen','Li','29 Jack Peel CCT',NULL,'Kellyville','AK','12345','United States','0430830888',0,'2025-12-15 01:52:12');
CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      position INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    );
INSERT INTO categories VALUES(1,NULL,'Electronics','electronics','Electronic devices and accessories',NULL,0,1);
INSERT INTO categories VALUES(2,1,'Laptops','laptops','Laptop computers',NULL,1,1);
INSERT INTO categories VALUES(3,1,'Smartphones','smartphones','Mobile phones',NULL,2,1);
INSERT INTO categories VALUES(4,NULL,'Clothing','clothing','Fashion and apparel',NULL,3,1);
INSERT INTO categories VALUES(5,4,'Men''s Clothing','mens-clothing','Clothing for men',NULL,4,1);
INSERT INTO categories VALUES(6,4,'Women''s Clothing','womens-clothing','Clothing for women',NULL,5,1);
INSERT INTO categories VALUES(7,NULL,'Home & Garden','home-garden','Home and garden products',NULL,6,1);
INSERT INTO categories VALUES(8,NULL,'Sports & Outdoors','sports-outdoors','Sports equipment and outdoor gear',NULL,7,1);
CREATE TABLE brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1
    );
INSERT INTO brands VALUES(1,'TechPro','techpro',NULL,'Premium electronics brand',1);
INSERT INTO brands VALUES(2,'StyleMax','stylemax',NULL,'Fashion and style',1);
INSERT INTO brands VALUES(3,'HomeComfort','homecomfort',NULL,'Home essentials',1);
INSERT INTO brands VALUES(4,'SportFlex','sportflex',NULL,'Sports equipment',1);
INSERT INTO brands VALUES(5,'EcoLife','ecolife',NULL,'Sustainable products',1);
CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      brand_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      compare_at_price REAL,
      sku TEXT UNIQUE,
      barcode TEXT,
      stock_quantity INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      weight REAL,
      dimensions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );
INSERT INTO products VALUES(1,2,1,'TechPro Laptop Pro 15','techpro-laptop-pro-15','High-performance laptop with 15-inch display, perfect for work and entertainment',1299.990000000000009,1499.990000000000009,'TECH-LAP-001',NULL,25,10,1,1,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(2,3,1,'TechPro Smartphone X1','techpro-smartphone-x1','Latest smartphone with advanced camera and long battery life',899.990000000000009,999.990000000000009,'TECH-PHN-001',NULL,50,10,1,1,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(3,5,2,'StyleMax Cotton T-Shirt','stylemax-cotton-tshirt','Comfortable cotton t-shirt in various colors',29.98999999999999844,NULL,'STY-TSH-001',NULL,100,10,1,0,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(4,5,2,'StyleMax Denim Jeans','stylemax-denim-jeans','Classic denim jeans with modern fit',79.98999999999999489,99.9899999999999949,'STY-JEN-001',NULL,60,10,1,0,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(5,6,2,'StyleMax Summer Dress','stylemax-summer-dress','Light and breezy summer dress',59.99000000000000198,NULL,'STY-DRS-001',NULL,40,10,1,0,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(6,7,3,'HomeComfort Throw Pillow Set','homecomfort-throw-pillow-set','Set of 2 decorative throw pillows',39.99000000000000198,49.99000000000000198,'HOM-PIL-001',NULL,75,10,1,0,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(7,8,4,'SportFlex Yoga Mat','sportflex-yoga-mat','Non-slip yoga mat with carrying strap',34.99000000000000198,NULL,'SPT-YOG-001',NULL,80,10,1,1,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(8,8,4,'SportFlex Running Shoes','sportflex-running-shoes','Lightweight running shoes with excellent cushioning',119.9899999999999949,149.990000000000009,'SPT-SHO-001',NULL,45,10,1,0,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(9,2,1,'TechPro Wireless Mouse','techpro-wireless-mouse','Ergonomic wireless mouse with precision tracking',24.98999999999999844,NULL,'TECH-MOU-001',NULL,150,10,1,0,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(10,2,1,'TechPro Bluetooth Headphones','techpro-bluetooth-headphones','Noise-cancelling wireless headphones',179.990000000000009,219.990000000000009,'TECH-HDP-001',NULL,35,10,1,1,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(11,7,5,'EcoLife Bamboo Cutting Board','ecolife-bamboo-cutting-board','Sustainable bamboo cutting board',29.98999999999999844,NULL,'ECO-CUT-001',NULL,90,10,1,0,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(12,7,5,'EcoLife Reusable Water Bottle','ecolife-reusable-water-bottle','Stainless steel insulated water bottle',24.98999999999999844,29.98999999999999844,'ECO-BTL-001',NULL,120,10,1,0,NULL,NULL,'2025-12-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO products VALUES(13,1,NULL,'Test Product from API','test-product-from-api','A test product created via API',99.9899999999999949,129.990000000000009,'TEST-002',NULL,50,10,1,0,NULL,NULL,'2025-12-14 05:52:51','2025-12-14 05:52:51');
CREATE TABLE product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      alt_text TEXT,
      position INTEGER DEFAULT 0,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
INSERT INTO product_images VALUES(1,1,'https://picsum.photos/seed/laptop1/400/400',NULL,0,1);
INSERT INTO product_images VALUES(2,1,'https://picsum.photos/seed/laptop2/400/400',NULL,1,0);
INSERT INTO product_images VALUES(3,2,'https://picsum.photos/seed/phone1/400/400',NULL,0,1);
INSERT INTO product_images VALUES(4,2,'https://picsum.photos/seed/phone2/400/400',NULL,1,0);
INSERT INTO product_images VALUES(5,3,'https://picsum.photos/seed/tshirt/400/400',NULL,0,1);
INSERT INTO product_images VALUES(6,4,'https://picsum.photos/seed/jeans/400/400',NULL,0,1);
INSERT INTO product_images VALUES(7,5,'https://picsum.photos/seed/dress/400/400',NULL,0,1);
INSERT INTO product_images VALUES(8,6,'https://picsum.photos/seed/pillow/400/400',NULL,0,1);
INSERT INTO product_images VALUES(9,7,'https://picsum.photos/seed/yogamat/400/400',NULL,0,1);
INSERT INTO product_images VALUES(10,8,'https://picsum.photos/seed/shoes/400/400',NULL,0,1);
INSERT INTO product_images VALUES(11,9,'https://picsum.photos/seed/mouse/400/400',NULL,0,1);
INSERT INTO product_images VALUES(12,10,'https://picsum.photos/seed/headphones/400/400',NULL,0,1);
INSERT INTO product_images VALUES(13,11,'https://picsum.photos/seed/kitchen/400/400',NULL,0,1);
INSERT INTO product_images VALUES(14,12,'https://picsum.photos/seed/bottle/400/400',NULL,0,1);
CREATE TABLE product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      price_adjustment REAL DEFAULT 0,
      stock_quantity INTEGER DEFAULT 0,
      sku TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
INSERT INTO product_variants VALUES(1,3,'Size','S',0.0,30,NULL);
INSERT INTO product_variants VALUES(2,3,'Size','M',0.0,40,NULL);
INSERT INTO product_variants VALUES(3,3,'Size','L',0.0,30,NULL);
INSERT INTO product_variants VALUES(4,4,'Size','30',0.0,15,NULL);
INSERT INTO product_variants VALUES(5,4,'Size','32',0.0,20,NULL);
INSERT INTO product_variants VALUES(6,4,'Size','34',0.0,15,NULL);
INSERT INTO product_variants VALUES(7,4,'Size','36',0.0,10,NULL);
INSERT INTO product_variants VALUES(8,8,'Size','8',0.0,10,NULL);
INSERT INTO product_variants VALUES(9,8,'Size','9',0.0,15,NULL);
INSERT INTO product_variants VALUES(10,8,'Size','10',0.0,12,NULL);
INSERT INTO product_variants VALUES(11,8,'Size','11',0.0,8,NULL);
CREATE TABLE orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      order_number TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
      shipping_address TEXT NOT NULL,
      billing_address TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping_cost REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      shipping_method TEXT,
      tracking_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
INSERT INTO orders VALUES(1,2,'ORD-1765496056593-567RC','cancelled','{"first_name":"Test","last_name":"Customer","street_address":"123 Test St","apartment":"Apt 4B","city":"Testville","state":"CA","postal_code":"94105","country":"USA","phone":"555-123-4567","email":"customer@example.com"}','{"first_name":"Test","last_name":"Customer","street_address":"123 Test St","apartment":"Apt 4B","city":"Testville","state":"CA","postal_code":"94105","country":"USA","phone":"555-123-4567","email":"customer@example.com"}',2599.980000000000018,5.990000000000000213,207.9984000000000037,0.0,2813.968399999999747,'Credit Card','paid','Standard Shipping',NULL,'Test order created for order detail testing','2025-12-11T23:34:16.593Z','2025-12-12 03:51:07');
INSERT INTO orders VALUES(2,2,'ORD-1765763542837-Q0F40','pending','{"id":7,"user_id":2,"label":"Home","first_name":"Bowen","last_name":"Li","street_address":"29 Jack Peel CCT","apartment":null,"city":"Kellyville","state":"AK","postal_code":"12345","country":"United States","phone":"0430830888","is_default":0}','{"id":7,"user_id":2,"label":"Home","first_name":"Bowen","last_name":"Li","street_address":"29 Jack Peel CCT","apartment":null,"city":"Kellyville","state":"AK","postal_code":"12345","country":"United States","phone":"0430830888","is_default":0}',4824.869999999999891,5.990000000000000213,385.9895999999999959,0.0,5216.849599999999555,'paypal','paid','Standard Shipping',NULL,'','2025-12-15T01:52:22.837Z','2025-12-15T01:52:22.837Z');
CREATE TABLE order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      product_snapshot TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    );
INSERT INTO order_items VALUES(1,1,1,NULL,2,1299.990000000000009,2599.980000000000018,'{"name":"TechPro Laptop Pro 15","image":"/images/laptop-1.jpg","sku":"TECH-LAP-001"}');
INSERT INTO order_items VALUES(2,2,12,NULL,1,24.98999999999999844,24.98999999999999844,'{"name":"EcoLife Reusable Water Bottle","image":"https://picsum.photos/seed/bottle/400/400","sku":"N/A"}');
INSERT INTO order_items VALUES(3,2,5,NULL,2,59.99000000000000198,119.9800000000000039,'{"name":"StyleMax Summer Dress","image":"https://picsum.photos/seed/dress/400/400","sku":"N/A"}');
INSERT INTO order_items VALUES(4,2,4,NULL,2,79.98999999999999489,159.9799999999999898,'{"name":"StyleMax Denim Jeans","image":"https://picsum.photos/seed/jeans/400/400","sku":"N/A"}');
INSERT INTO order_items VALUES(5,2,3,NULL,4,29.98999999999999844,119.9599999999999938,'{"name":"StyleMax Cotton T-Shirt","image":"https://picsum.photos/seed/tshirt/400/400","sku":"N/A"}');
INSERT INTO order_items VALUES(6,2,2,NULL,2,899.990000000000009,1799.980000000000018,'{"name":"TechPro Smartphone X1","image":"https://picsum.photos/seed/phone1/400/400","sku":"N/A"}');
INSERT INTO order_items VALUES(7,2,1,NULL,2,1299.990000000000009,2599.980000000000018,'{"name":"TechPro Laptop Pro 15","image":"https://picsum.photos/seed/laptop1/400/400","sku":"N/A"}');
CREATE TABLE cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      session_id TEXT,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, unit_price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id)
    );
INSERT INTO cart_items VALUES(2,10,NULL,1,NULL,2,'2025-12-13 04:24:01','2025-12-13 04:24:01',0.0);
INSERT INTO cart_items VALUES(6,17,NULL,1,NULL,2,'2025-12-13 10:18:31','2025-12-13 10:18:31',0.0);
INSERT INTO cart_items VALUES(10,1,NULL,12,NULL,2,'2025-12-14 22:39:46','2025-12-14 22:39:46',0.0);
INSERT INTO cart_items VALUES(11,1,NULL,9,NULL,1,'2025-12-14 22:41:06','2025-12-14 22:41:06',0.0);
INSERT INTO cart_items VALUES(18,2,NULL,1,NULL,2,'2025-12-15 01:57:51','2025-12-15 01:57:51',1299.990000000000009);
CREATE TABLE wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );
CREATE TABLE reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT,
      content TEXT,
      is_verified_purchase INTEGER DEFAULT 0,
      helpful_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
INSERT INTO reviews VALUES(1,1,2,5,'Excellent laptop for work and entertainment','This laptop has been amazing for both my work and personal use. The battery life is impressive and the performance is smooth.',1,0,'2025-11-11 23:02:33','2025-12-11 23:02:33');
INSERT INTO reviews VALUES(2,1,1,4,'Great performance, minor issues','Overall a great laptop. The only issue I had was with the trackpad sensitivity, but after adjusting settings it works fine.',0,1,'2025-11-16 23:02:33','2025-12-11 23:02:33');
INSERT INTO reviews VALUES(3,2,2,5,'Best smartphone I have owned','The camera quality is outstanding and the battery lasts all day with heavy use. Highly recommended!',1,0,'2025-11-21 23:02:33','2025-12-11 23:02:33');
INSERT INTO reviews VALUES(4,3,2,4,'Comfortable and good quality','The fabric is soft and comfortable. Fits true to size. Would buy again.',1,0,'2025-11-26 23:02:33','2025-12-11 23:02:33');
INSERT INTO reviews VALUES(5,8,2,5,'Perfect for daily runs','These shoes are lightweight and provide excellent support. My feet feel great even after long runs.',1,0,'2025-12-01 23:02:33','2025-12-11 23:02:33');
INSERT INTO reviews VALUES(6,4,2,5,'Test Review with Images','This is a test review for image upload functionality',0,0,'2025-12-12 04:51:58','2025-12-12 04:51:58');
CREATE TABLE review_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    );
INSERT INTO review_images VALUES(1,6,'/uploads/reviews/images-1765515118865-312786634.jpg');
INSERT INTO review_images VALUES(2,6,'/uploads/reviews/images-1765515118870-549080495.jpg');
INSERT INTO review_images VALUES(3,6,'/uploads/reviews/images-1765515118870-533289114.jpg');
CREATE TABLE promo_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed')),
      value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_uses INTEGER,
      current_uses INTEGER DEFAULT 0,
      start_date DATETIME,
      end_date DATETIME,
      is_active INTEGER DEFAULT 1
    );
INSERT INTO promo_codes VALUES(1,'WELCOME10','percentage',10.0,50.0,100,0,NULL,NULL,1);
INSERT INTO promo_codes VALUES(2,'SAVE20','percentage',20.0,100.0,50,0,NULL,NULL,1);
INSERT INTO promo_codes VALUES(3,'FREESHIP','fixed',10.0,75.0,200,0,NULL,NULL,1);
CREATE TABLE recently_viewed (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      session_id TEXT,
      product_id INTEGER NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
CREATE TABLE product_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      recommendation_type TEXT NOT NULL CHECK(recommendation_type IN ('frequently_bought_together', 'customers_also_bought', 'related_products')),
      recommended_product_id INTEGER NOT NULL,
      score REAL DEFAULT 0.0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (recommended_product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(product_id, recommendation_type, recommended_product_id)
    );
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('categories',8);
INSERT INTO sqlite_sequence VALUES('brands',5);
INSERT INTO sqlite_sequence VALUES('products',13);
INSERT INTO sqlite_sequence VALUES('product_images',14);
INSERT INTO sqlite_sequence VALUES('product_variants',11);
INSERT INTO sqlite_sequence VALUES('users',18);
INSERT INTO sqlite_sequence VALUES('promo_codes',3);
INSERT INTO sqlite_sequence VALUES('reviews',6);
INSERT INTO sqlite_sequence VALUES('orders',2);
INSERT INTO sqlite_sequence VALUES('order_items',7);
INSERT INTO sqlite_sequence VALUES('cart_items',18);
INSERT INTO sqlite_sequence VALUES('review_images',3);
INSERT INTO sqlite_sequence VALUES('addresses',7);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_recently_viewed_user ON recently_viewed(user_id);
CREATE INDEX idx_recently_viewed_session ON recently_viewed(session_id);
CREATE INDEX idx_recently_viewed_product ON recently_viewed(product_id);
CREATE INDEX idx_recommendations_product ON product_recommendations(product_id);
CREATE INDEX idx_recommendations_type ON product_recommendations(recommendation_type);
COMMIT;
