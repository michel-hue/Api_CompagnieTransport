export const AuthQueries = {
  checkedEmployeAuthorization: `
    SELECT a.accessid,
           a.password,
           a.expiredon,
           e.employeid,
           a.firstuse,
           (SELECT Date(a.expiredon) - Date(current_date)) as isexpired,
           0 as type,
           e.type as isroot,
           (SELECT a.anneefiscaleid FROM anneefiscale a WHERE a.etat = 1 AND a.status = 1) as anneefiscaleid
    FROM access a
    INNER JOIN employe e ON e.employeid = a.employeid AND e.status = 1
    WHERE a.status = 1
      AND (a.username = $1 OR e.employeid::text = $1)
  `,

  checkedAgentRecenseurAuthorization: `
    SELECT a.accessid,
           a.password,
           a.expiredon,
           ag.agentrecenseurid as employeid,
           a.firstuse,
           (SELECT Date(a.expiredon) - Date(current_date)) as isexpired,
           1 as type
    FROM access a
    INNER JOIN agentrecenseur ag ON ag.agentrecenseurid = a.employeid AND ag.status = 1
    WHERE a.status = 1
      AND a.username = $1
  `,

  checkApiKey: `
    SELECT ak.expiredon
    FROM apikey ak
    WHERE ak.apikey = $1
      AND ak.status = 1
  `,

  addActivity: `
    INSERT INTO activite (activiteid, libelle, date, origine, utilisateurid)
    VALUES ($1, $2, $3, $4, $5)
  `,
};