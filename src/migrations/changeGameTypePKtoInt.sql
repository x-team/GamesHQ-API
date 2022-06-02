ALTER TABLE public."Game" DROP CONSTRAINT "Game__gameTypeId_fkey";
ALTER TABLE public."GameItemAvailability" DROP CONSTRAINT "GameItemAvailability__gameTypeId_fkey";
ALTER TABLE public."Achievement" DROP CONSTRAINT "Achievement__gameTypeId_fkey";

ALTER TABLE public."Game" RENAME COLUMN "_gameTypeId" TO  "_gameTypeName";
ALTER TABLE public."GameItemAvailability" RENAME COLUMN "_gameTypeId" TO  "_gameTypeName";
ALTER TABLE public."Achievement" RENAME COLUMN "_gameTypeId" TO  "_gameTypeName";

ALTER TABLE public."Game" ADD COLUMN "_gameTypeId" INTEGER;
ALTER TABLE public."GameItemAvailability" ADD COLUMN "_gameTypeId" INTEGER;
ALTER TABLE public."Achievement" ADD COLUMN"_gameTypeId" INTEGER;

ALTER TABLE public."GameType" RENAME COLUMN id TO name;
ALTER TABLE public."GameType" ADD UNIQUE (name);
ALTER TABLE public."GameType" DROP CONSTRAINT "GameType_pkey";
ALTER TABLE public."GameType" ADD COLUMN id SERIAL;
ALTER table public."GameType" ADD PRIMARY KEY (id);

UPDATE public."Game" 
SET "_gameTypeId" = GT.id 
FROM public."Game" as GIA
left JOIN public."GameType" as GT ON GIA."_gameTypeName" = GT.name
where public."Game"."_gameTypeName" = GIA."_gameTypeName";

UPDATE public."GameItemAvailability" 
SET "_gameTypeId" = GT.id 
FROM public."GameItemAvailability" as GIA
left JOIN public."GameType" as GT ON GIA."_gameTypeName" = GT.name
where public."GameItemAvailability"."_gameTypeName" = GIA."_gameTypeName";

UPDATE public."Achievement" 
SET "_gameTypeId" = GT.id 
FROM public."Achievement" as GIA
left JOIN public."GameType" as GT ON GIA."_gameTypeName" = GT.name
where public."Achievement"."_gameTypeName" = GIA."_gameTypeName";

ALTER TABLE public."Game" 
ADD CONSTRAINT "Game__gameTypeId_fkey" 
FOREIGN KEY ("_gameTypeId") 
REFERENCES public."GameType"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."GameItemAvailability" 
ADD CONSTRAINT "GameItemAvailability__gameTypeId_fkey" 
FOREIGN KEY ("_gameTypeId") 
REFERENCES public."GameType"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Achievement" 
ADD CONSTRAINT "Achievement__gameTypeId_fkey" 
FOREIGN KEY ("_gameTypeId") 
REFERENCES public."GameType"(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE public."Game" ALTER COLUMN "_gameTypeId" SET NOT NULL;
ALTER TABLE public."GameItemAvailability" ALTER COLUMN "_gameTypeId" SET NOT NULL;
ALTER TABLE public."Achievement" ALTER COLUMN "_gameTypeId" SET NOT NULL;

ALTER TABLE public."Game" DROP COLUMN "_gameTypeName";
ALTER TABLE public."GameItemAvailability" DROP COLUMN "_gameTypeName";
ALTER TABLE public."Achievement" DROP COLUMN "_gameTypeName";

ALTER table public."GameItemAvailability" ADD PRIMARY KEY ("_gameTypeId","_itemId");