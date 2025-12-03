// debug-generation.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("=== Debugging Prisma Generation ===\n");

// 1. Check if prisma CLI works
try {
    console.log("1. Testing Prisma CLI...");
    const version = execSync('npx prisma --version', { encoding: 'utf8' });
    console.log("✅ Prisma CLI:", version.trim());
} catch (error) {
    console.log("❌ Prisma CLI failed:", error.message);
    process.exit(1);
}

// 2. Run generation with detailed output
console.log("\n2. Running prisma generate...");
try {
    const output = execSync('npx prisma generate 2>&1', { encoding: 'utf8' });
    console.log("Generation output:");
    console.log(output);
} catch (error) {
    console.log("❌ Generation failed:");
    console.log("Error:", error.message);
    console.log("Output:", error.stdout?.toString());
    console.log("Stderr:", error.stderr?.toString());
}

// 3. Check generated files
console.log("\n3. Checking generated files...");
const clientDir = path.join(__dirname, 'node_modules', '.prisma', 'client');
if (fs.existsSync(clientDir)) {
    console.log("✅ .prisma/client exists");
    
    // Check for critical files
    const criticalFiles = [
        'index.js',
        'index.d.ts',
        'package.json'
    ];
    
    criticalFiles.forEach(file => {
        const filePath = path.join(clientDir, file);
        const exists = fs.existsSync(filePath);
        console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'Found' : 'Missing'}`);
        
        if (exists && file === 'package.json') {
            try {
                const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`   Version: ${pkg.version}`);
                console.log(`   Main: ${pkg.main}`);
            } catch (e) {
                console.log("   Error reading package.json");
            }
        }
    });
    
    // List all files
    console.log("\nAll files in .prisma/client:");
    const files = fs.readdirSync(clientDir);
    files.forEach(file => {
        const filePath = path.join(clientDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${stats.size} bytes)`);
    });
    
} else {
    console.log("❌ .prisma/client does not exist");
    
    // Check what IS there
    console.log("\nChecking node_modules for prisma folders:");
    const nodeModules = path.join(__dirname, 'node_modules');
    const items = fs.readdirSync(nodeModules);
    items.filter(item => item.includes('prisma')).forEach(item => {
        const itemPath = path.join(nodeModules, item);
        const isDir = fs.statSync(itemPath).isDirectory();
        console.log(`   - ${item} ${isDir ? '(directory)' : '(file)'}`);
    });
}

// 4. Test the actual require
console.log("\n4. Testing require...");
try {
    // Clear cache
    delete require.cache[require.resolve('@prisma/client')];
    
    const { PrismaClient } = require('@prisma/client');
    console.log("✅ PrismaClient imported");
    
    // Check if it's a constructor
    if (typeof PrismaClient === 'function') {
        console.log("✅ PrismaClient is a function/constructor");
        
        // Try to instantiate
        const prisma = new PrismaClient();
        console.log("✅ PrismaClient instance created");
        
        // Check instance methods
        if (typeof prisma.$connect === 'function') {
            console.log("✅ PrismaClient has $connect method");
        }
    } else {
        console.log("❌ PrismaClient is not a constructor:", typeof PrismaClient);
    }
    
} catch (error) {
    console.log("❌ Require failed:");
    console.log("   Error:", error.message);
    console.log("   Stack:", error.stack.split('\n')[0]);
}
