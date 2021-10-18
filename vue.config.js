module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(qsf)$/i,
          use: [
            {
              loader: "text-loader"
            }
          ]
        }
      ]
    }
  }
};
