const serviceService = require("../services/serviceService");


const getAllServices = async (req, res) => {
  try {
    const services = await serviceService.getAllServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE service (handle file upload)
const createService = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const service = await serviceService.createService({
      name,
      description,
      image,
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateService = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const service = await serviceService.updateService(
      req.params.id,
      updateData
    );
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteService = async (req, res) => {
  try {
    await serviceService.deleteService(req.params.id);
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
