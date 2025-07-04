import { CombinerRestClient } from './src/CombinerRestClient';

async function testFileSystem() {
    const client = new CombinerRestClient({
        moduleId: 'www',
        baseUrl: 'http://localhost:22003'
    });

    try {
        // Test writing a file
        console.log('Writing test file...');
        await client.writeFile('test.txt', 'Hello, this is a test file!');
        console.log('✅ File written successfully');

        // Test reading the file
        console.log('\nReading test file...');
        const content = await client.readFile('test.txt');
        console.log('✅ File content:', content);

        // Test listing directory
        console.log('\nListing directory...');
        const files = await client.listDir('.');
        console.log('✅ Directory contents:', files);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the test
testFileSystem().catch(console.error); 