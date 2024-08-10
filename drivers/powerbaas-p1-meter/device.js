'use strict';

const { Device } = require('homey');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class MyDevice extends Device {

  async onInit() {
    this.log('MyDevice has been initialized');

    this._ipAddress = null;

    setInterval(() => {
      this.getData();
    }, 1000);

    this.getData();
  }

  async getData() {
    const hostname = this._ipAddress || "powerbaas.local";

    const url = `http://${hostname}/`;
    const options = {
      method: 'GET',
      headers: {
        'Connection': 'close'
      },
      timeout: 1000
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();
      const meterReading = jsonData.meterReading;

      //this.log('Received data:', jsonData, meterReading);

      this.setCapabilityValue('measure_power', meterReading.powerUsage);
      this.setCapabilityValue('meter_power.voltageL1', meterReading.voltageL1);
      this.setCapabilityValue('meter_power.voltageL2', meterReading.voltageL2);
      this.setCapabilityValue('meter_power.voltageL3', meterReading.voltageL3);
      this.setCapabilityValue('meter_power.currentL1', meterReading.currentL1);
      this.setCapabilityValue('meter_power.currentL2', meterReading.currentL2);
      this.setCapabilityValue('meter_power.currentL3', meterReading.currentL3);
      this.setCapabilityValue('meter_power.powerDeliverHigh', meterReading.powerDeliverHigh / 1000);
      this.setCapabilityValue('meter_power.powerDeliverLow', meterReading.powerDeliverLow / 1000);
      this.setCapabilityValue('meter_power.powerReturnHigh', meterReading.powerReturnHigh / 1000);
      this.setCapabilityValue('meter_power.powerReturnLow', meterReading.powerReturnLow / 1000);
      this.setCapabilityValue('meter_gas', meterReading.gas / 1000);

      this._ipAddress = jsonData.system.ip;
      this.setAvailable();
    } catch (error) {
      this.log('Error in HTTP request:', error.message);
      console.error('Error in HTTP request:', error.message);
      this.setUnavailable("Error in HTTP request: " + error.message);
    }
  }
}

module.exports = MyDevice;