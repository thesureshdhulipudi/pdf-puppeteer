const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const url = process.argv[2];  // URL passed from Java code
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for specific element and ensure CSS is applied
    try {
        // Wait for the element to be present
        await page.waitForSelector('.services-section', { timeout: 120000 });

        // Optionally wait for CSS properties to be applied
        await page.waitForFunction(() => {
            const element = document.querySelector('.services-section');
            return window.getComputedStyle(element).getPropertyValue('color') !== 'rgba(0, 0, 0, 0)'; // Adjust check as needed
        });

    } catch (error) {
        console.error('Error: Element or CSS not found within the timeout period.');
        await page.screenshot({ path: 'error_screenshot.png' }); // Take screenshot for debugging
        const htmlContent = await page.content();
        fs.writeFileSync('error_debug.html', htmlContent); // Save HTML content for inspection
        await browser.close();
        return;
    }

    // Optionally wait for additional time to ensure all dynamic data is loaded
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

    // Generate PDF with fullPage option
	const pdf = await page.pdf({
	    width: '1200px',  // Set to match viewport width
	    height: '800px',  // Set to match viewport height
	    printBackground: true,
	    margin: {
	        top: '0px',
	        right: '0px',
	        bottom: '0px',
	        left: '0px'
	    }
	});

    await browser.close();

    // Output the PDF content as a binary stream
    process.stdout.write(pdf);
})();

