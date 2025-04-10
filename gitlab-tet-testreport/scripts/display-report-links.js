
function go() {
    console.log("Yo from Frode1")
    $("span:contains('UIT:archive')").each( (ix, element) => {
        console.log("Elem:" + element.innerText)
    
        const anchor = element.parentNode
        const url = anchor.href
        const match = url.match(/\/jobs\/(\d+)\//);
        const testName = element.innerText.replace(":archive", "")

        if (match) {
            const jobId = match[1]
            console.log("JobID:", match[1]);  // Outputs: 9605818527
            const suiteId = testNameToFolder(testName)
            const link = jobUrlTpl.replace("[JOB_ID]", jobId).replace("[SUITE_ID]", suiteId)
       
            const bulletPoint = $('<span>').text('•').css('margin', '5px'); 
            const anchorLink = $('<a>').attr('href', link).text("Report for " + testName);
            const bulletLinkWrapper = $('<div>').css('margin', '8px').append(bulletPoint, anchorLink);

            $('section[data-testid="mr-widget-app"]').append(bulletLinkWrapper);
        }
    })
}

function testNameToFolder(testName) {
    if (testName.indexOf("Veh") != -1) return "TaasSuite-ruter"
    if (testName.indexOf("Merch") != -1) return "MerchantSuite-ruter"
    if (testName.indexOf("ØKT") != -1) return "DefaultSuite-okt"
    if (testName.indexOf("BRA") != -1) return "DefaultSuite-brakar"
    if (testName.indexOf("AKT") != -1) return "DefaultSuite-akt"
    return "DefaultSuite"    
}


setTimeout(() => {
    go()
}, 2000);

// SUITE_ID = MerchantSuite-ruter   
const jobUrlTpl = "https://ruter-as.gitlab.io/-/rutersalg/android/-/jobs/[JOB_ID]/artifacts/reports/[SUITE_ID]/html-report/index.html"

