-- Create Service table (matches your existing table)
CREATE TABLE "Service" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    image TEXT,
    "formFields" JSONB,
    slug TEXT
);

-- Create User table (matches your existing table)
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'resident',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    phone TEXT
);

-- Create ServiceRequest table (matches your existing table)
CREATE TABLE "ServiceRequest" (
    id SERIAL PRIMARY KEY,
    "serviceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("serviceId") REFERENCES "Service"(id),
    FOREIGN KEY ("userId") REFERENCES "User"(id)
);
