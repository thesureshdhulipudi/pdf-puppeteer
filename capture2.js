const puppeteer = require('puppeteer');

(async () => {
    const url = process.argv[2]; // URL passed from Java code
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the viewport size based on your UI's dimensions
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the provided URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Optionally wait for a specific element to load
    await page.waitForSelector('.services-section', { timeout: 120000 });

    // Get the page's total height to adjust the scaling
    const bodyHandle = await page.$('body');
    const { width, height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();

    // Adjust scale to fit the entire content onto a single PDF page
    const scale = Math.min(1, 800 / height); // Adjust height to fit within 800px (A4 size)

    // Generate PDF with appropriate scaling
    const pdf = await page.pdf({
        printBackground: true,
        width: `${width}px`, // Use the width of the UI content
        height: `${height}px`, // Use the total height of the UI content
        scale: scale,          // Scale content to fit
        margin: { top: '10px', bottom: '10px', left: '10px', right: '10px' },
    });

    await browser.close();

    // Output the PDF content as a binary stream
    process.stdout.write(pdf);
})();
