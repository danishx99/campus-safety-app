module.exports = {
    collectCoverage: true,      // collect coverage from all files imported during testing
    coverageReporters: ['text', 'cobertura'],       // cobertura to generate CI/CD coverage reports 
    passWithNoTests: true,                          // jest won't fail if no test found
    verbose: true,
    testEnvironment: 'node',
    detectOpenHandles: true,
    errorOnDeprecated: true,        // throws an error id deprecated API's are used 
}
