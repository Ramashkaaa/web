import request from "supertest";
import User from "../models/userModel.js";
import app from "../server.js";
import { generateToken } from "../utils.js";
import bcrypt from "bcryptjs";

export const userTests = () => {
	it("should update user profile", async () => {
		const user = {
			id: 1,
			name: "Julia",
			email: "julia@test.com",
			password: "randomHash",
			isAdmin: false,
		};

		const updatedUser = {
			id: 1,
			name: "Julia Khlodetska",
			email: "julia@test.com",
			isAdmin: false,
		};

		jest.spyOn(User, "findByPk").mockReturnValue(user);
		jest
			.spyOn(User, "update")
			.mockReturnValue([null, [{ dataValues: updatedUser }]]);

		const userToken = generateToken(user);

		const res = await request(app)
			.put("/api/users/profile")
			.set("Authorization", `Bearer ${userToken}`)
			.send({ name: updatedUser.name });

		const { token, ...newUser } = res.body;
		expect(res.statusCode).toEqual(200);
		expect(token).toBeDefined();
		expect(newUser).toStrictEqual(updatedUser);
	});

	it("should return 401 when token is not provided on update", async () => {
		const user = {
			id: 1,
			name: "Julia",
			email: "julia@test.com",
			password: "randomHash",
			isAdmin: false,
		};

		const updatedUser = {
			id: 1,
			name: "Julia Khlodetska",
			email: "julia@test.com",
			isAdmin: false,
		};

		jest.spyOn(User, "findByPk").mockReturnValue(user);
		jest
			.spyOn(User, "update")
			.mockReturnValue([null, [{ dataValues: updatedUser }]]);

		const res = await request(app)
			.put("/api/users/profile")
			.send({ name: updatedUser.name });

		const { token, ...newUser } = res.body;
		expect(res.statusCode).toEqual(401);
	});

	it("should return user's information if user successful signed in", async () => {
		const password = "password";
		const user = {
			id: 1,
			name: "Julia",
			email: "julia@test.com",
			isAdmin: false,
		};

		jest
			.spyOn(User, "findOne")
			.mockReturnValue({ ...user, password: bcrypt.hashSync(password) });

		const res = await request(app).post("/api/users/signin").send({
			email: "julia@test.com",
			password: password,
		});

		const { token, ...userData } = res.body;

		expect(res.statusCode).toEqual(200);
		expect(token).toBeDefined();
		expect(userData).toStrictEqual(user);
	});

	it("should return 401 when password is invalid on signed in", async () => {
		const password = "password";
		const user = {
			id: 1,
			name: "Julia",
			email: "julia@test.com",
			isAdmin: false,
		};

		jest
			.spyOn(User, "findOne")
			.mockReturnValue({ ...user, password: bcrypt.hashSync(password) });

		const res = await request(app).post("/api/users/signin").send({
			email: "julia@test.com",
			password: "pa",
		});

		const { token, ...userData } = res.body;

		expect(res.statusCode).toEqual(401);
	});

	it("should return user's information if user successful registered", async () => {
		const user = {
			name: "Julia",
			email: "julia@test.com",
		};

		const id = 1;
		const password = "password1A@";

		jest.spyOn(User, "findOne").mockReturnValue(null);
		jest.spyOn(User, "create").mockReturnValue({ ...user, id });

		const res = await request(app)
			.post("/api/users/register")
			.send({ ...user, password });

		const { token, ...userData } = res.body;

		expect(res.statusCode).toEqual(200);
		expect(token).toBeDefined();
		expect(userData).toStrictEqual({ ...user, id });
	});

	it("should return 400 when pass is invalid", async () => {
		const user = {
			name: "Julia",
			email: "julia@test.com",
		};

		const id = 1;
		const password = "pas";

		jest.spyOn(User, "findOne").mockReturnValue(null);
		jest.spyOn(User, "create").mockReturnValue({ ...user, id });

		const res = await request(app)
			.post("/api/users/register")
			.send({ ...user, password });

		const { token, ...userData } = res.body;

		expect(res.statusCode).toEqual(400);
	});

	it("should return user by id", async () => {
		const id = 1;
		const user = {
			id,
			name: "Julia",
			email: "julia@test.com",
			password: "randomHash",
			isAdmin: false,
		};

		jest.spyOn(User, "findByPk").mockReturnValue(user);

		const res = await request(app).get(`/api/users/${id}`).send();
		expect(res.statusCode).toEqual(200);
		expect(res.body).toStrictEqual(user);
	});

	it("should return 404 if user not found", async () => {
		const id = 1;
		const users = [
			{
				id,
				name: "Julia",
				email: "julia@test.com",
				password: "randomHash",
				isAdmin: false,
			},
		];

		jest
			.spyOn(User, "findByPk")
			.mockImplementation((userId) => users.find((user) => user.id === userId));
		const res = await request(app).get(`/api/users/101`).send();
		expect(res.statusCode).toEqual(404);
	});

	it("should return all users", async () => {
		const users = [
			{
				id: 1,
				name: "Julia",
				email: "julia@test.com",
				password: "randomHash",
				isAdmin: false,
			},
			{
				id: 2,
				name: "Max",
				email: "max@test.com",
				password: "randomHash",
				isAdmin: true,
			},
			{
				id: 3,
				name: "Bill",
				email: "bill@test.com",
				password: "randomHash",
				isAdmin: false,
			},
		];

		jest.spyOn(User, "findAll").mockReturnValue(users);

		const res = await request(app).get("/api/users");
		expect(res.statusCode).toEqual(200);
		expect(res.body).toStrictEqual(users);
	});
};
