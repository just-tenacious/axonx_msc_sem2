const logger = {
    info: (message, meta = '') => {
        console.log(`[\x1b[34mINFO\x1b[0m] [${new Date().toISOString()}] ${message}`, meta);
    },
    error: (message, meta = '') => {
        console.error(`[\x1b[31mERROR\x1b[0m] [${new Date().toISOString()}] ${message}`, meta);
    },
    warn: (message, meta = '') => {
        console.warn(`[\x1b[33mWARN\x1b[0m] [${new Date().toISOString()}] ${message}`, meta);
    },
    success: (message, meta = '') => {
        console.log(`[\x1b[32mSUCCESS\x1b[0m] [${new Date().toISOString()}] ${message}`, meta);
    }
};

export default logger;
