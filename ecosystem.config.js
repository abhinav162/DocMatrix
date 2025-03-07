module.exports = {
  apps: [
    {
      name: "pdf-generator",
      script: "npm",
      args: "run start",
      watch: false,
      env: {
        PORT: 4000,
      },
    },
  ],
};
