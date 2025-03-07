module.exports = {
    apps: [
        {
            name: 'docmatrix',
            script: './src/index.ts',
            interpreter: 'ts-node',
            watch: true,
            env: {
                NODE_ENV: 'production',
                PORT: 4000,
                HOST: '127.0.0.1'
            }
        }
    ]
};