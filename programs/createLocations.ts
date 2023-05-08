import { createReadStream } from "fs";
import csvParser from "csv-parser";
import prisma from "../prisma/prisma";

interface CsvRow {
  city: string;
  district: string;
}

const main = async () => {
  const filePath = "./location.csv";
  const data = await readCsvFile(filePath);

  for (const row of data) {
    const cityName = row.city;
    const districtName = row.district;

    let city = await prisma.city.findFirst({ where: { name: cityName } });

    if (!city) {
      city = await prisma.city.create({ data: { name: cityName } });
    }

    let district = await prisma.district.findFirst({
      where: { name: districtName },
    });

    if (!district) {
      await prisma.district.create({
        data: {
          name: districtName,
          city: { connect: { id: city.id } },
        },
      });
    }
  }

  await prisma.$disconnect();
};

const readCsvFile = async (filePath: string): Promise<CsvRow[]> => {
  const data: CsvRow[] = [];
  const stream = createReadStream(filePath).pipe(
    csvParser({ headers: ["city", "district"] })
  );

  for await (const row of stream) {
    data.push(row as CsvRow);
  }

  return data;
};

main().catch((error) => {
  console.error("Error: ", error);
  process.exit(1);
});
