-- Create the three databases (one per bounded context) on first container start.
CREATE DATABASE auth_db;
CREATE DATABASE product_db;
CREATE DATABASE inventory_db;
CREATE DATABASE order_db;

GRANT ALL PRIVILEGES ON DATABASE auth_db      TO ecommerce;
GRANT ALL PRIVILEGES ON DATABASE product_db   TO ecommerce;
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO ecommerce;
GRANT ALL PRIVILEGES ON DATABASE order_db     TO ecommerce;
