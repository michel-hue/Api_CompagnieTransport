export const AuthQueries = {
  checkedEmployeAuthorization: `
        SELECT a.accessid,
               a.password,
               a.password,
               a.expiredon,
               e.employeid,
               a.firstuse,
               (SELECT Date(a.expiredon) - Date(current_date)) as isexpired,
               0 as type,
                e.type as isroot,
            (select a.anneefiscaleid from anneefiscale a where a.etat = 1 and a.status = 1) as anneefiscaleid
        FROM access a
                 INNER JOIN employe e on e.employeid = a.employeid and e.status = 1
        WHERE a.status = 1
          and a.username = $1 or e.employeid = $1
    `,

  checkedAgentRecenseurAuthorization: `
        SELECT a.accessid,
               a.password,
               a.password,
               a.expiredon,
               ag.agentrecenseurid as employeid,
               a.firstuse,
               (SELECT Date(a.expiredon) - Date(current_date)) as isexpired,
               1 as type
        FROM access a
            INNER JOIN agentrecenseur ag on ag.agentrecenseurid = a.employeid and ag.status = 1
        WHERE a.status = 1
          and a.username = $1
    `,

  checkApiKey: `
        SELECT ak.expiredon
        FROM apikey ak
        WHERE ak.apikey = $1
          and ak.status = 1
    `,

  addActivity: `
    INSERT INTO activite (activiteid, libelle, date, origine, utilisateurid) 
    VALUES ($1, $2, $3, $4, $5)`,
};
