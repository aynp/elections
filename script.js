import { JSDOM } from "jsdom"
import axios from "axios"
import { migrate_db, db, migrationClient, queryClient } from "./db";
import { sql } from "drizzle-orm";
import { state, party, constituency, candidate } from "./schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function getAllParties() {
  const dom = await axios.get("https://results.eci.gov.in/PcResultGenJune2024/index.htm")

  const { document } = new JSDOM(dom.data).window
  const rows = document.querySelectorAll("table > tbody > tr")

  let i = 0;
  const parties = []
  rows.forEach(row => {
    const partyName = row.querySelector("td:nth-child(1)").textContent
    const [fullName, shortName] = partyName.split(" - ")

    parties.push({
      name: fullName,
      shortName: shortName
    })
  })

  try {
    await db.insert(party).values(parties);
  } catch (e) {
    console.error(e)
  }
}

async function getAllStates() {
  const dom = await axios.get("https://results.eci.gov.in/PcResultGenJune2024/index.htm");
  const { document } = new JSDOM(dom.data).window;

  const states = document.querySelectorAll("select > option");
  const statesData = [];

  states.forEach(state => {
    if (state.value === "") return
    statesData.push({
      code: state.value,
      name: state.textContent
    })
  })

  try {
    await db.insert(state).values(statesData)
  } catch (e) {
    console.error(e)
  }
}

async function getAllConstituencies() {
  const states = await db.select().from(state)

  for (const state of states) {
    const dom = await axios.get(`https://results.eci.gov.in/PcResultGenJune2024/partywiseresult-${state.code}.htm`);
    const { document } = new JSDOM(dom.data).window;
    const constituencies = document.querySelectorAll("select > option");
    const constituencyData = [];

    constituencies.forEach(constituency => {
      if (constituency.value === "") return
      const constituencyCode = constituency.value
      const [constituencyName, _] = constituency.textContent.split(" - ")

      constituencyData.push({
        name: constituencyName,
        code: constituencyCode,
        stateId: state.id,
      })
    })

    console.log(constituencyData);

    try {
      await db.insert(constituency).values(constituencyData)
    } catch (e) {
      console.error(e)
    }
  }
}

/**
 * @type {Record<string, number>}
 */
const partyIdCache = {};

/**
 * @param {string} partyName 
 * @returns {number}
 */
async function getPartyId(partyName) {
  if (partyIdCache[partyName]) {
    return partyIdCache[partyName]
  }
  let p = await db.select().from(party).where(sql`name = ${partyName}`)

  // Parties which have not won any seats are not present in the database
  if (p.length === 0) {
    /**
     * @param {string} name 
     * @returns {string}
     */
    const shortName = (name) => {
      const words = name.split(" ");
      return words.map(word => word[0] === '(' ? word[1] : word[0]).join("").toUpperCase()
    }
    p = await db.insert(party).values({ name: partyName, shortName: shortName(partyName) }).returning();
  }

  partyIdCache[partyName] = p[0].id
  return p[0].id;
}

async function getAllCandidates() {
  const constituencies = await db.select().from(constituency)

  for (const constituency of constituencies) {
    console.log(constituency)
    const dom = await axios.get(`https://results.eci.gov.in/PcResultGenJune2024/Constituencywise${constituency.code}.htm`);
    const { document } = new JSDOM(dom.data).window;

    const candidates = document.querySelectorAll("table > tbody > tr");
    const candidateData = []

    for (const candidate of candidates) {
      const candidateInfo = candidate.querySelectorAll("td")
      const candidateName = candidateInfo[1].textContent

      const partyName = candidateInfo[2].textContent
      const partyId = await getPartyId(partyName)

      const evmVotes = candidateInfo[3].textContent
      const postalVotes = candidateInfo[4].textContent
      const totalVotes = candidateInfo[5].textContent
      const percentage = candidateInfo[6].textContent

      candidateData.push({
        name: candidateName,
        partyId: partyId,
        constituencyId: constituency.id,
        evmVotes: parseInt(evmVotes) || 0,
        postalVotes: parseInt(postalVotes) || 0,
        totalVotes: parseInt(totalVotes) || 0,
        votePercentage: parseFloat(percentage) || 100,
      })
    }

    try {
      await db.insert(candidate).values(candidateData)
    } catch (e) {
      console.error(e)
    }
  }
}

async function main() {
  await migrate(migrate_db, { migrationsFolder: './drizzle' });
  console.log("Migrated")

  await getAllStates()
  await getAllParties()
  await getAllConstituencies()

  await getAllCandidates()
}

await main()