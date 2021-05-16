import request from "supertest";
import app from "../server.js";
import { generateToken } from "../utils.js";
import Order from "../models/orderModel.js";

export const orderTests = () => {
	const user = {
		id: 1,
		name: "Julia",
		email: "julia@test.com",
		password: "randomHash",
		isAdmin: false,
	};

	const orderItem = {
		id: 1,
		orderId: 1,
		productId: 1,
		quantity: 2,
		price: 10,
	};

	const itemsPrice = orderItem.price * orderItem.quantity;
	const taxPrice = 0.2;
	const shippingPrice = 3.5;

	const order = {
		id: 1,
		userId: 1,
		paymentStatusId: 1,
		paymentMethod: "paypal",
		orderStatusId: 1,
		fullName: "Order for product",
		shippingAddress: "Lviv, Horodotska 24",
		city: "Lviv",
		postalCode: 35478,
		county: "Ukraine",
		shippingPrice,
		taxPrice,
	};

	const additionalOrderData = {
		totalPrice: itemsPrice + taxPrice + shippingPrice,
		itemsPrice,
	};

	const dbOrder = { ...order, orderItem: [orderItem] };

	it("should create order", async () => {
		jest
			.spyOn(Order, "create")
			.mockReturnValue({ ...dbOrder, dataValues: dbOrder });

		const userToken = generateToken(user);

		const res = await request(app)
			.post("/api/orders")
			.set("Authorization", `Bearer ${userToken}`)
			.send({
				...order,
				orderItem,
			});

		expect(res.statusCode).toEqual(201);
		expect(res.body).toStrictEqual({
			message: "New Order Created",
			order: {
				...order,
				...additionalOrderData,
				orderItem: [orderItem],
			},
		});
	});

	it("should return 400 if cart is empty", async () => {
		jest
			.spyOn(Order, "create")
			.mockReturnValue({ ...dbOrder, dataValues: dbOrder });

		const orderItem = [];
		const userToken = generateToken(user);

		const res = await request(app)
			.post("/api/orders")
			.set("Authorization", `Bearer ${userToken}`)
			.send({
				...order,
				orderItem,
			});

		expect(res.statusCode).toEqual(400);
	});

	it("should return order by id", async () => {
		jest
			.spyOn(Order, "findByPk")
			.mockReturnValue({ ...dbOrder, dataValues: dbOrder });

		const userToken = generateToken(user);

		const res = await request(app)
			.get("/api/orders/1")
			.set("Authorization", `Bearer ${userToken}`)
			.send({
				...order,
				...additionalOrderData,
				orderItem,
			});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toStrictEqual({
			...order,
			...additionalOrderData,
			orderItem: [orderItem],
		});
	});

	it("should return 404 if order is not found", async () => {
		jest.spyOn(Order, "findByPk").mockImplementation((orderId) => null);

		const userToken = generateToken(user);

		const res = await request(app)
			.get("/api/orders/99")
			.set("Authorization", `Bearer ${userToken}`)
			.send({
				...order,
				...additionalOrderData,
				orderItem,
			});

		expect(res.statusCode).toEqual(404);
	});

	it("should return user orders", async () => {
		const orders = [
			{
				id: 1,
				userId: 1,
				paymentStatusId: 1,
				paymentMethod: "paypal",
				orderStatusId: 1,
				fullName: "Order for product",
				shippingAddress: "Lviv, Horodotska 24",
				city: "Lviv",
				postalCode: 35478,
				county: "Ukraine",
				shippingPrice,
				taxPrice,
			},
			{
				id: 2,
				userId: 1,
				paymentStatusId: 2,
				paymentMethod: "paypal",
				orderStatusId: 2,
				fullName: "Order for product",
				shippingAddress: "Lviv, Horodotska 24",
				city: "Lviv",
				postalCode: 35478,
				county: "Ukraine",
				shippingPrice,
				taxPrice,
			},
			{
				id: 3,
				userId: 2,
				paymentStatusId: 3,
				paymentMethod: "paypal",
				orderStatusId: 3,
				fullName: "Order for product",
				shippingAddress: "Lviv, Horodotska 24",
				city: "Lviv",
				postalCode: 35478,
				county: "Ukraine",
				shippingPrice,
				taxPrice,
			},
			{
				id: 4,
				userId: 1,
				paymentStatusId: 4,
				paymentMethod: "paypal",
				orderStatusId: 4,
				fullName: "Order for product",
				shippingAddress: "Lviv, Horodotska 24",
				city: "Lviv",
				postalCode: 35478,
				county: "Ukraine",
				shippingPrice,
				taxPrice,
			},
		];

		jest
			.spyOn(Order, "findAll")
			.mockImplementation(({ userId }) =>
				orders.filter((order) => order.userId === userId)
			);

		const userToken = generateToken(user);

		const res = await request(app)
			.get("/api/orders/userOrderList")
			.set("Authorization", `Bearer ${userToken}`)
			.send();

		expect(res.statusCode).toEqual(200);
		expect(res.body).toStrictEqual(
			orders.filter((order) => order.userId === user.id)
		);
	});
};
