"use client";
import {useState} from "react";
export function SellerFeedImport(){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setMessage("");setError("");
  const form=e.currentTarget;
  const file=(form.elements.namedItem("feed") as HTMLInputElement).files?.[0];
  if(!file){setError("Επίλεξε αρχείο XML ή JSON.");return;}
  if(file.size>5*1024*1024){setError("Το αρχείο πρέπει να είναι έως 5MB.");return;}
  setBusy(true);
  try{const response=await fetch("/api/seller/import",{method:"POST",headers:{"Content-Type":file.name.toLowerCase().endsWith(".xml")?"application/xml":"application/json"},body:await file.text()});const data=await response.json();if(!response.ok)throw new Error(data.error+(data.invalidRows?.length?" Γραμμές: "+data.invalidRows.join(", "):""));setMessage("Εισήχθησαν "+data.imported+" προϊόντα. Βρίσκονται σε αναμονή ελέγχου.");form.reset();}
  catch(err){setError(err instanceof Error?err.message:"Αποτυχία εισαγωγής.");}
  finally{setBusy(false);}
 }
 return <form className="feed-import" onSubmit={submit}><label>Αρχείο προϊόντων (XML ή JSON)<input name="feed" type="file" accept=".xml,.json,application/xml,application/json" required/></label><button className="primary-btn" disabled={busy}>{busy?"Γίνεται εισαγωγή…":"Εισαγωγή προϊόντων"}</button>{message&&<p className="success-message">{message}</p>}{error&&<p className="form-error">{error}</p>}<small>Υποστηρίζονται πεδία name/title, description, price, stock/inventory, url/storeUrl, image/imageUrl, sku, ean/barcode, mpn, availability και shipping.</small></form>
}