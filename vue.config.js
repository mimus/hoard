module.exports = {
  runtimeCompiler: true,
  baseUrl: process.env.NODE_ENV === 'production'
    ? '/hoard_website/'
    : '/'
}
