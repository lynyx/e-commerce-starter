const fs = require('node:fs/promises');

exports.deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (e) {
    throw new Error('Error while deleting file:');
  }
}
