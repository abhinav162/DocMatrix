module.exports = {
  apps: [
    {
      name: "docmatrix",
      script: "npm",
      args: "run start",
      watch: false,
      env: {
        PORT: 4000,
      },
    },
    {
        name: "cron",
        script: "npm",
        args: "run cron",
        watch: false
    }
  ],
};
