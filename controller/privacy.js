function publicPath(req, res) {
  const data = {
    message: "public",
  };
  return res.status(200).json(data);
}

function privatePath(req, res) {
  const userData = req.user;
  const data = {
    message: "private",
    data: userData,
  };
  return res.status(200).json(data);
}

const privacyController = {
  publicPath,
  privatePath,
};

export default privacyController;
