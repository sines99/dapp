/*var assert = require('assert');
var selenium = require('selenium-webdriver');

describe('Doichain dApp webfrontend', function() {
    it('calculates weights', function() {
        var driver = new selenium.Builder().
        withCapabilities(selenium.Capabilities.chrome()).
        build();
        //withCapabilities(selenium.Capabilities.firefox()).
        driver.get("https://decohere.herokuapp.com/planets");

        const until = selenium.until;
       //   selenium.wait(until.elementIsVisible(selenium.By.id('wt'), 5000);
//var weight = selenium.wait(until.elementLocated(selenium.By.id('wt')), 3000);

        //var weight = driver.isElementPresent(selenium.By.id('wt'));
        //c
        //
        var weight = driver.wait(until.elementLocated(selenium.By.id('wt'),3000));
       // var weight = driver.wait(function () {
          //  return driver.isElementPresent(selenium.By.id('wt'));

       // }, 5000);
        console.log(weight);

        assert.equal(weight, true, "Weight entry not possible");

        driver.quit();
    });
});*/
/*var assert = require('assert'),
   // test = require('selenium-webdriver/testing'),
    webdriver = require('selenium-webdriver');

describe('Doichain dApp webfrontend', function() {

    it('should work', function() {
        var driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();
        driver.get('http://www.google.com');
        var searchBox = driver.findElement(webdriver.By.name('q'));
        searchBox.sendKeys('simple programmer');
        searchBox.getAttribute('value').then(function(value) {
            assert.equal(value, 'simple programmer');
        });
        driver.quit();
    });
}); */

const { Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('Doichain dApp webfrontend', () => {
    const driver = new Builder().forBrowser('chrome').build();

    it('should go to nehalist.io and check the title', async () => {
        await driver.get('https://www.google.com');
        await driver.sleep(20000);
        await driver.findElement(By.name('q')).sendKeys('nehalist', Key.ENTER);
        await driver.wait(until.elementLocated(By.id('search')));
        await driver.findElement(By.linkText('nehalist.io')).click();
        const title = await driver.getTitle();

        expect(title).to.equal('nehalist.io');
    });

    after(async () => driver.quit());
});
/*
var driver,webdriver = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome")
/**
 * Set chrome command line options/switches
 */
//var chromeOptions = new chrome.Options();
//chromeOptions.addArguments("test-type");
//chromeOptions.addArguments("start-maximized");
//chromeOptions.addArguments("--js-flags=--expose-gc");
//chromeOptions.addArguments("--enable-precise-memory-info");
//chromeOptions.addArguments("--disable-popup-blocking");
//chromeOptions.addArguments("--disable-default-apps");
//chromeOptions.addArguments("--disable-infobars");

//driver = new webdriver.Builder()
//    .forBrowser("chrome")
//    .setChromeOptions(chromeOptions)
//    .build();

//describe("Doichain dApp webfrontend", function () {

//    it("login to dApp and check balance", function () {
//        driver.get("http://www.google.com");
//    });

//})
