'use strict';
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const client_1 = require('@prisma/client');
const colors_1 = __importDefault(require('../items/colors'));
const icons_1 = __importDefault(require('../items/icons'));
const prisma = new client_1.PrismaClient();
async function main() {
	const items = [
		...icons_1.default.map((icon) => ({
			name: icon.name,
			price: 2000,
			description: icon.name,
			hidden: false,
			locked: false,
			role: icon.role,
			image: icon.image,
			type: 'icon'
		})),
		...colors_1.default.map((color) => ({
			name: color.name,
			price: 2000,
			description: color.name,
			hidden: false,
			locked: false,
			role: color.role,
			type: 'color'
		}))
	];
	const result = await prisma.item.createMany({
		data: items
	});
	console.log(result);
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
//# sourceMappingURL=seed.js.map
