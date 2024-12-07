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

    // Wait for the button to appear
    const buttonSelector = '#impersonate-button'; // Adjust the selector to match your button's ID
    await page.waitForSelector(buttonSelector, { timeout: 120000 });

    // Impersonate the EID by entering it and clicking the button
    await page.evaluate(
        (eid, selector) => {
            const button = document.querySelector(selector);
            if (button) {
                const eidInput = document.querySelector('#eid-input'); // Adjust selector for EID input field
                if (eidInput) {
                    eidInput.value = eid; // Set the impersonated EID
                    eidInput.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event
                }
                button.click(); // Click the impersonation button
            }
        },
        impersonatedEid,
        buttonSelector
    );


    // Wait for the username input and type the username
    await page.waitForSelector('#USERID');
    await page.type('#USERID', usernameValue);

    // Wait for the password input and type the password
    await page.waitForSelector('#PASSWORD');
    await page.type('#PASSWORD', passwordValue);

    // Wait for the sign-in link and click it
    await page.waitForSelector('a[onclick="return formSubmit();"]');
    await page.evaluate(() => {
        const signInLink = document.querySelector('a[onclick="return formSubmit();"]');
        if (signInLink) {
            signInLink.click();
        }
    });

    // Wait for navigation or some indication of successful login
    try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
        console.log("Successfully signed in.");
    } catch (e) {
        console.error("Navigation timeout. Login may have failed.");
    }

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
