const fs = require('fs').promises;

class FileUtils {


  /**
   * This is the Main Function.
   * Records an email timestamp. If email is acting suspiciously, an error is thrown.
   * @param {*} filePath
   * @param {*} email
   * @returns
   */
  async recordEmailTimestamp(filePath, email) {
    const isSuspicious = await this.areLast20RecordsSuspicious(filePath, email);
    if (isSuspicious) {
      throw new Error('There are too many requests in a short time frame!');
    }

    try {
      let data = await this.readJsonFromFile(filePath);
      if (data && data.hasOwnProperty(email)) {
        data[email].push(new Date().toISOString());
      } else {
        data[email] = [new Date().toISOString()];
      }
      await this.writeJsonToFile(filePath, data);
    } catch (err) {
      console.error(err);
    }
  }


// Checks if a file exists at the given path. If not, creates it.
async ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    // If file doesn't exist, create an empty one
    if (err.code === 'ENOENT') {
      await fs.writeFile(filePath, '', 'utf8');
      return true;
    } else {
      // Some other error occurred (e.g., permissions issue)
      console.error(`Error accessing file at ${filePath}:`, err);
      return false;
    }
  }
}

  // Reads and returns JSON data from a file.
  async readJsonFromFile(filePath) {
    await this.ensureFileExists(filePath);

    const fileContent = await fs.readFile(filePath, 'utf8');
    return (fileContent && JSON.parse(fileContent)) || {};
  }

  // Writes JSON data to a file.
  async writeJsonToFile(filePath, jsonData) {
    const formattedJson = JSON.stringify(jsonData, null, 2);
    await fs.writeFile(filePath, formattedJson, 'utf8');
  }


  // Checks if the last 20 records for a specific email were created within 2 minutes.
  async areLast20RecordsSuspicious(filePath, email) {
    try {
      const data = await this.readJsonFromFile(filePath);
      if (!data.hasOwnProperty(email)) {
        return false;  // Email not found in records.
      }

      const recentTimestamps = data[email].slice(-20);  // Extract the last 20 timestamps.

      if (recentTimestamps.length < 20) {
        return false;  // Not enough records to evaluate.
      }

      const currentTime = new Date();
      return recentTimestamps.every(timestamp => {
        const recordDate = new Date(timestamp);
        const timeDifference = currentTime - recordDate;
        const differenceInMinutes = timeDifference / (1000 * 60);
        return differenceInMinutes < 2;
      });

    } catch (err) {
      console.error(err);
      return false;
    }
  }

}

module.exports = FileUtils;
