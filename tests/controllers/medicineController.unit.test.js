jest.mock('../../models/Medicine');
const Medicine = require('../../models/Medicine');
const medCtrl = require('../../controllers/medicineController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => jest.resetAllMocks());

test('searchMedicines returns empty array when q missing', async () => {
  const req = { query: {} };
  const res = mockRes();
  await medCtrl.searchMedicines(req, res);
  expect(res.json).toHaveBeenCalledWith([]);
});

test('searchMedicines queries medicines', async () => {
  const req = { query: { q: 'Par' } };
  const res = mockRes();
  Medicine.find.mockReturnValue({ limit: jest.fn().mockResolvedValue([{ name: 'Paracetamol' }]) });
  await medCtrl.searchMedicines(req, res);
  expect(Medicine.find).toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith([{ name: 'Paracetamol' }]);
});

test('createMedicine validates name and creates', async () => {
  const req1 = { body: {} };
  const res1 = mockRes();
  await medCtrl.createMedicine(req1, res1);
  expect(res1.status).toHaveBeenCalledWith(400);

  const req2 = { body: { name: 'Med', genericName: 'G', category: 'C', unit: 'unit' } };
  const res2 = mockRes();
  Medicine.create.mockResolvedValue({ id: 'm1' });
  await medCtrl.createMedicine(req2, res2);
  expect(Medicine.create).toHaveBeenCalled();
  expect(res2.status).toHaveBeenCalledWith(201);
});

test('listMedicines and listLowStock return lists', async () => {
  const res = mockRes();
  Medicine.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([{ name: 'a' }]) });
  await medCtrl.listMedicines({}, res);
  expect(res.json).toHaveBeenCalledWith([{ name: 'a' }]);

  const res2 = mockRes();
  Medicine.find.mockResolvedValue([{ name: 'b' }]);
  await medCtrl.listLowStock({}, res2);
  expect(res2.json).toHaveBeenCalledWith([{ name: 'b' }]);
});

test('getMedicine 404 and success', async () => {
  const res1 = mockRes();
  const req1 = { params: { id: 'x' } };
  Medicine.findById.mockResolvedValue(null);
  await medCtrl.getMedicine(req1, res1);
  expect(res1.status).toHaveBeenCalledWith(404);

  const res2 = mockRes();
  Medicine.findById.mockResolvedValue({ id: 'x' });
  await medCtrl.getMedicine(req1, res2);
  expect(res2.json).toHaveBeenCalledWith({ id: 'x' });
});

test('updateMedicine 404 and success', async () => {
  const req = { params: { id: 'x' }, body: { name: 'n' } };
  const res1 = mockRes();
  Medicine.findByIdAndUpdate.mockResolvedValue(null);
  await medCtrl.updateMedicine(req, res1);
  expect(res1.status).toHaveBeenCalledWith(404);

  const res2 = mockRes();
  Medicine.findByIdAndUpdate.mockResolvedValue({ id: 'x', name: 'n' });
  await medCtrl.updateMedicine(req, res2);
  expect(res2.json).toHaveBeenCalledWith({ id: 'x', name: 'n' });
});

test('adjustStock validations and updates', async () => {
  const req1 = { params: { id: 'x' }, body: { change: 'bad' } };
  const res1 = mockRes();
  await medCtrl.adjustStock(req1, res1);
  expect(res1.status).toHaveBeenCalledWith(400);

  const req2 = { params: { id: 'x' }, body: { change: 5 } };
  const res2 = mockRes();
  Medicine.findById.mockResolvedValue(null);
  await medCtrl.adjustStock(req2, res2);
  expect(res2.status).toHaveBeenCalledWith(404);

  const req3 = { params: { id: 'x' }, body: { change: -100 } };
  const res3 = mockRes();
  const med = { stockQuantity: 10, save: jest.fn() };
  Medicine.findById.mockResolvedValue(med);
  await medCtrl.adjustStock(req3, res3);
  expect(res3.status).toHaveBeenCalledWith(400);

  const req4 = { params: { id: 'x' }, body: { change: 5 } };
  const res4 = mockRes();
  const med2 = { stockQuantity: 10, save: jest.fn() };
  Medicine.findById.mockResolvedValue(med2);
  await medCtrl.adjustStock(req4, res4);
  expect(med2.save).toHaveBeenCalled();
  expect(res4.json).toHaveBeenCalledWith(med2);
});

test('deleteMedicine 404 and success', async () => {
  const req = { params: { id: 'x' } };
  const res1 = mockRes();
  Medicine.findByIdAndDelete.mockResolvedValue(null);
  await medCtrl.deleteMedicine(req, res1);
  expect(res1.status).toHaveBeenCalledWith(404);

  const res2 = mockRes();
  Medicine.findByIdAndDelete.mockResolvedValue({ id: 'x' });
  await medCtrl.deleteMedicine(req, res2);
  expect(res2.json).toHaveBeenCalledWith({ message: 'Medicine deleted' });
});
