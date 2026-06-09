export class FormatResponse {
  setResponseGet(results: any) {
    const response: any = {};
    if (results.rowCount <= 0) {
      response.status = false;
      response.data = [];
      response.statuscode = 200;
      response.count = results.rowCount;
      response.message = "Aucune donnée trouvée dans le système";
    } else {
      response.status = true;
      response.data = results.rows;
      response.statuscode = 200;
      response.count = results.rowCount;
      response.message =
        results.rowCount + " donnée(s) trouvée(s) dans le système";
    }

    return response;
  }
  setResponseGete(results: any) {
    const response: any = {};
    if (results.rowCount <= 0) {
      response.status = false;
      response.data = [];
      response.statuscode = 200;
      response.count = results.rowCount;
      response.message = "Aucune donnée trouvée dans le système";
    } else {
      response.status = true;
      response.data = results.rows;
      response.echeance = results.rows;
      response.statuscode = 200;
      response.count = results.rowCount;
      response.message =
        results.rowCount + " donnée(s) trouvée(s) dans le système";
    }

    return response;
  }
  setResponseCreate(results: any) {
    const response: any = {};
    if (!results.rowCount) {
      response.data = [];
      response.statuscode = 403;
      response.status = false;
      response.message = "Erreur lors de la création de l'element";
    } else {
      response.data = [];
      response.status = true;
      response.statuscode = 200;
      response.message = " Element créé avec succès";
    }
    return response;
  }

  setResponseDelete(results: any) {
    const response: any = {};
    if (!results.rowCount) {
      response.status = false;
      response.data = [];
      response.statuscode = 403;
      response.message = "Erreur lors de la suppression de l'element";
    } else {
      response.status = true;
      response.data = [];
      response.statuscode = 200;
      response.message = "Element supprimé avec succès";
    }

    return response;
  }

  setResponseUpdate(results: any) {
    const response: any = {};
    if (!results.rowCount) {
      console.error("=== ERREUR setResponseUpdate ===");
      console.error("rowCount:", results.rowCount);
      console.error("results:", JSON.stringify(results, null, 2));
      console.error("===============================");
      response.status = false;
      response.data = [];
      response.statuscode = 403;
      response.message = "Erreur lors de la mise à jour de l'element";
    } else {
      response.status = true;
      response.data = [];
      response.statuscode = 200;
      response.message = "Element mis à jour avec succès!";
    }

    return response;
  }

  setResponseErrorFromServer() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 501,
      message: "Une erreur est survenue, veuillez contacter l'administrateur",
    };

    return response;
  }

  setCustomErrorResponse(
    statuscode: number,
    message: string,
    status: boolean = false,
  ) {
    const response: any = {
      status: status,
      statuscode: statuscode,
      message: message,
    };

    return response;
  }

  setResponseErrorFromValidator(error: any) {
    const response: any = {
      status: false,
      data: [],
      statuscode: 405,
      message: error.details[0].message,
    };
    return response;
  }

  setResponseErrorFromAPIKeyExpired() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 402,
      message: "Votre clé API a expiré , veuillez contacter l'administrateur!",
    };
    return response;
  }

  setResponseErrorFromAPIKey() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 402,
      message: "Pas autorisé, votre clé API n'est pas valide.",
    };
    return response;
  }

  setResponseErrorFromToken() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 401,
      message: "Token d'authentification invalide!",
    };
    return response;
  }

  setResponseFromUserNotFound() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 200,
      message: "L'utilisateur n'existe pas dans le système",
    };
    return response;
  }
  setResponseFromUserFound() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 200,
      message: "L'utilisateur existe déjà pas dans le système",
    };
    return response;
  }
  setResponseCreateError() {
    const response: any = {
      data: [],
      statuscode: 403,
      status: false,
      message: "Erreur lors de la création de l'element",
    };
    return response;
  }
  setResponseDeleteError() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 403,
      message: "Erreur lors de la suppression de l'element",
    };
    return response;
  }
  setResponseUpdateError() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 200,
      message: "Erreur lors de la modification de l'element",
    };
    return response;
  }

  setResponseFromAccessInvalid() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 200,
      message: "Nom d'utilisateur ou mot de passe invalide !",
    };
    return response;
  }

  setResponseFromConnexionSuccess(data: any) {
    const response: any = {
      status: true,
      data: data,
      statuscode: 200,
      message: "1 donnée trouvée dans le système",
    };
    return response;
  }

  setResponseFromAccessBloqued() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 401,
      message: "Veuillez contacter l'administrateur car votre accès est bloqué",
    };
    return response;
  }

  setResponseFromAccessExpired() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 401,
      message: "Veuillez contacter l'administrateur car votre accès a expiré",
    };
    return response;
  }

  setResponseFromNotPermission() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 401,
      message:
        "Aucune permission définie pour ce utilisateur, veuillez contactez l'administrateur",
    };
    return response;
  }

  setResponseFromAuthorizationNotFound() {
    const response: any = {
      status: false,
      statuscode: 401,
      message: "Header d'autorisation ou Clé API introuvable",
    };
    return response;
  }

  setResponseGetError() {
    const response: any = {
      status: true,
      statuscode: 200,
      message: "aucune donnée trouvée dans le système",
    };
    return response;
  }

  setResponseGetWithPagination(results, totalrow, page) {
    const response: any = {};
    if (results.rowCount <= 0) {
      response.status = false;
      response.data = [];
      response.statuscode = 200;
      response.count = totalrow;
      response.message = "Aucune donnée trouvée dans le système";
    } else {
      response.status = true;
      response.count = totalrow;
      response.data = results.rows;
      response.statuscode = 200;
      response.page = page;
      response.message =
        results.rowCount + " donnée(s) trouvée(s) dans le système";
    }

    return response;
  }

  setResponseConnectGet(data: any, results: any, dataUser?: any) {
    const response: any = {};
    if (results.rowCount <= 0) {
      response.status = false;
      response.data = [];
      response.statuscode = 200;
      response.message = "Aucune donnée trouvée dans le système";
    } else {
      response.status = true;
      response.data = dataUser;
      response.statuscode = 200;
      response.message =
        results.rowCount + " donnée(s) trouvée(s) dans le système";
    }

    return response;
  }

  setResponseFromInfoNotFount() {
    const response: any = {
      status: false,
      data: [],
      statuscode: 401,
      message:
        "Aucune information trouvée. Veuillez contacter l'administrateur!",
    };
    return response;
  }
  /**
   * Function to set Error Response from query results
   * required one argument type as
   *  * type == 1 => 501 : Intern error server
   *  * type == 2 => 200 : Nothing data founded
   *  * type == 3 => 403 : Create Error
   *  * type == 4 => 200 : Element already exist
   *  * type == 5 => 200 : Element doesn't exist
   *
   * @param {number} type
   * @param {string} errorMessage
   * @returns {any}
   *
   */
  setResponseError(type: number, errorMessage: string = ""): any {
    const response: any = {};
    if (type === 1) {
      response.status = false;
      response.data = [];
      response.statuscode = 501;
      response.message =
        "Une erreur est survenue, veuillez contacter l'administrateur";
      console.error(errorMessage);
    } else if (type === 2) {
      response.status = false;
      response.data = [];
      response.statuscode = 200;
      response.message = "Aucune donnée trouvée dans le système";
    } else if (type === 3) {
      response.data = [];
      response.status = false;
      response.statuscode = 403;
      response.message = "Erreur lors de la création de l'element";
      console.error(errorMessage);
    } else if (type === 4) {
      response.data = [];
      response.status = false;
      response.message = "Cet element existe déjà dans le système";
    } else if (type === 5) {
      response.status = false;
      response.data = [];
      response.message = "Cet element n'existe pas dans le systeme";
      console.error(errorMessage);
    } else if (type === 6) {
      response.status = true;
      response.data = [];
      response.statuscode = 200;
      response.message = "Operation effectuee avec succes";
    } else if (type === 7) {
      response.status = true;
      response.data = [];
      response.statuscode = 200;
      response.message = errorMessage;
    } else if (type === 8) {
      response.status = false;
      response.data = [];
      response.statuscode = 200;
      response.message = errorMessage;
    } else if (type === 9) {
        response.status = false;
        response.data = [];
        response.statuscode = 200;
        response.message = errorMessage;
        console.error(errorMessage);
    }

    return response;
  }
}
