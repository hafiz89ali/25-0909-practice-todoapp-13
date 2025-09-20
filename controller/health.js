function getHealth(req, res) {
  const data = {
    message: "👌🏼 Practice 13 is ok.",
  };
  return res.status(200).json(data);
}

function postHealth(req, res) {
  const body = req.body;
  const data = {
    message: "👌🏼 Practice 13 is ok.",
    data: body,
  };
  return res.status(200).json(data);
}

const healthController = {
  getHealth,
  postHealth,
};

export default healthController;
